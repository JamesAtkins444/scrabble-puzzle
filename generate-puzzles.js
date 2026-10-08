#!/usr/bin/env node

/*
 * Scrabble Puzzle pre-generator
 *
 * This script opens the real game in a headless Chromium browser, runs the
 * existing puzzle generator/solver, and saves the exact resulting puzzle
 * state as JSON. The public game then loads that JSON instead of generating
 * and solving the puzzle in every visitor's browser.
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const { chromium } = require("playwright");

const ROOT = __dirname;
const PUZZLE_DIR = path.join(ROOT, "puzzles");
const PORT = 4173;

function getDateKey(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function addDays(date, days) {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + days);
    return result;
}

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        days: 30,
        force: false,
        date: null
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--days") {
            options.days = Math.max(1, Math.min(365, Number(args[++i]) || 30));
        } else if (args[i] === "--date") {
            options.date = args[++i];
        } else if (args[i] === "--force") {
            options.force = true;
        }
    }

    return options;
}

function startServer() {
    const mimeTypes = {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".txt": "text/plain; charset=utf-8",
        ".json": "application/json; charset=utf-8"
    };

    const server = http.createServer((req, res) => {
        let requestPath = decodeURIComponent((req.url || "/").split("?")[0]);

        if (requestPath === "/") {
            requestPath = "/index.html";
        }

        const filePath = path.resolve(ROOT, "." + requestPath);

        if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
            res.writeHead(403);
            res.end("Forbidden");
            return;
        }

        fs.readFile(filePath, (error, data) => {
            if (error) {
                res.writeHead(error.code === "ENOENT" ? 404 : 500);
                res.end(error.code === "ENOENT" ? "Not found" : "Server error");
                return;
            }

            const type = mimeTypes[path.extname(filePath).toLowerCase()] ||
                "application/octet-stream";

            res.writeHead(200, {
                "Content-Type": type,
                "Cache-Control": "no-store"
            });
            res.end(data);
        });
    });

    return new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(PORT, "127.0.0.1", () => resolve(server));
    });
}

async function generatePuzzle(browser, dateKey) {
    // Use a fresh page for every date so pre-generation init scripts and
    // puzzle state cannot leak from one puzzle into the next.
    const page = await browser.newPage();

    try {
        await page.addInitScript(date => {
            window.__SCRABBLE_PREGENERATE__ = true;
            window.__SCRABBLE_PREGENERATE_DATE__ = date;
        }, dateKey);

        await page.goto(`http://127.0.0.1:${PORT}/index.html?pregenerate=${dateKey}`, {
            waitUntil: "load"
        });

        // Some puzzle seeds are much harder to generate than others.
        // Give the existing generator up to 10 minutes rather than using
        // Playwright's 30-second default.
        await page.waitForFunction(
            () => Boolean(window.__SCRABBLE_PUZZLE_EXPORT__),
            { timeout: 600000 }
        );

        return await page.evaluate(() => window.__SCRABBLE_PUZZLE_EXPORT__);
    } finally {
        await page.close();
    }
}

async function main() {
    const options = parseArgs();

    fs.mkdirSync(PUZZLE_DIR, { recursive: true });

    const startDate = options.date
        ? new Date(`${options.date}T00:00:00Z`)
        : new Date();

    if (Number.isNaN(startDate.getTime())) {
        throw new Error(`Invalid --date value: ${options.date}`);
    }

    const server = await startServer();
    const browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox"]
    });

    try {
        for (let offset = 0; offset < options.days; offset++) {
            const dateKey = getDateKey(addDays(startDate, offset));
            const outputPath = path.join(PUZZLE_DIR, `${dateKey}.json`);

            if (fs.existsSync(outputPath) && !options.force) {
                console.log(`Skipping existing puzzle ${dateKey}`);
                continue;
            }

            console.log(`Generating puzzle ${dateKey}…`);
            let puzzle = null;
            let lastError = null;

            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    puzzle = await generatePuzzle(browser, dateKey);
                    break;
                } catch (error) {
                    lastError = error;
                    console.warn(
                        `Puzzle ${dateKey} attempt ${attempt}/3 failed: ${error.message}`
                    );

                    if (attempt < 3) {
                        console.log(`Retrying puzzle ${dateKey} with a fresh browser page…`);
                    }
                }
            }

            if (!puzzle) {
                throw new Error(
                    `Could not generate puzzle ${dateKey} after 3 attempts. ${lastError?.message || ""}`
                );
            }

            if (!puzzle || puzzle.date !== dateKey) {
                throw new Error(`Generated puzzle date mismatch for ${dateKey}`);
            }

            fs.writeFileSync(
                outputPath,
                JSON.stringify(puzzle, null, 2) + "\n",
                "utf8"
            );

            console.log(
                `Saved ${outputPath} — solver score: ${puzzle.bestSolution.score}`
            );
        }

    } finally {
        await browser.close();
        await new Promise(resolve => server.close(resolve));
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
