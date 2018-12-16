/**
 * @fileoverview Gulp file for Lone Dissent
 * @author <a href="mailto:Jeff@pcjs.org">Jeff Parsons</a> (@jeffpar)
 * @copyright © Jeff Parsons 2018
 * @license GPL-3.0
 */

 "use strict";

let glob = require("glob");
let gulp = require("gulp");
let fs = require("fs");
let mkdirp = require("mkdirp");
let path = require("path");
let parseXML = require('xml2js').parseString;

let stdio = require("./lib/stdio");
let printf = stdio.printf;
let sprintf = stdio.sprintf;

let pkg = require("./package.json");

/**
 * @typedef {Object} Justice
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} Court
 * @property {string} id
 * @property {string} name
 * @property {Array.<Justice>} justices
 * @property {string} start
 * @property {string} startFormatted
 * @property {string} stop
 * @property {string} stopFormatted
 * @property {string} reason
 */

/**
 * parseCSV(text, maxRows, keyIgnore, keyUnique)
 *
 * @param {string} text
 * @param {number} [maxRows] (default is zero, implying no maximum; heading row is not counted toward the limit)
 * @param {string} [keyIgnore] (name of field, if any, that should be ignored; typically the key of the subset fields)
 * @param {string} [keyUnique] (name of first subset field, if any, containing data for unique subsets)
 * @return {Array.<Object>}
 */
function parseCSV(text, maxRows=0, keyIgnore="", keyUnique="")
{
    let rows = [];
    let headings, fields;
    let lines = text.split(/\r?\n/);
    let keySubset = keyUnique + 's';
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (!line) continue;
        let row = {};
        let fields = parseCSVFields(line);
        if (!headings) {
            headings = fields;
            /*
             * Make sure all headings are non-empty and unique.
             */
            for (let h = 0; h < headings.length; h++) {
                let heading = headings[h];
                if (!heading || row[headings[h]] !== undefined) {
                    printf("CSV field heading %d (%s) is invalid or duplicate\n", h, heading);
                    heading = "field" + (h + 1);
                }
                row[heading] = h;
            }
        } else {
            let subset = null;
            let matchedPrevious = !!rows.length;
            for (let h = 0; h < headings.length; h++) {
                let field = fields[h];
                let heading = headings[h];
                if (heading == keyIgnore) continue;
                if (heading == keyUnique) {
                    subset = {};
                }
                if (!subset && matchedPrevious) {
                    if (rows[rows.length-1][heading] != field) {
                        matchedPrevious = false;
                    }
                }
                if (!subset) {
                    row[heading] = field;
                } else {
                    subset[heading] = field;
                }
            }
            if (headings.length != fields.length) {
                printf("CSV row %d has %d fields, expected %d\n", i, fields.length, headings.length);
            }
            if (subset) {
                if (!matchedPrevious) {
                    row[keySubset] = [];
                    row[keySubset].push(subset);
                } else {
                    rows[rows.length-1][keySubset].push(subset);
                    continue;
                }
            }
            if (!maxRows || i <= maxRows) rows.push(row);
        }
    }
    return rows;
}

/**
 * parseCSVFields(line)
 *
 * @param {string} line
 * @return {Array.<string>}
 */
function parseCSVFields(line)
{
    let field = "";
    let fields = [];
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        let ch = line[i];
        if (!inQuotes) {
            if (ch == ',') {
                fields.push(field);
                field = "";
            }
            else if (ch == '"' && !field.length) {
                inQuotes = true;
            }
            else {
                field += ch;
            }
        }
        else {
            if (ch == '"') {
                if (i < line.length - 1 && line[i+1] == '"') {
                    field += ch;
                    i += 1;
                } else {
                    inQuotes = false;
                }
            }
            else {
                field += ch;
            }
        }
    }
    fields.push(field);
    if (inQuotes) {
        printf("CSV quote error: %s\n", line);
    }
    return fields;
}

/**
 * readTextFile(fileName)
 *
 * @param {string} fileName
 * @return {string}
 */
function readTextFile(fileName)
{
    let text;
    try {
        text = fs.readFileSync(fileName, "utf8");
    }
    catch(err) {
        printf("%s\n", err.message);
    }
    return text;
}

/**
 * writeTextFile(fileName, text, fOverwrite)
 *
 * @param {string} fileName
 * @param {string} text
 * @param {boolean} [fOverwrite] (default is false)
 */
function writeTextFile(fileName, text, fOverwrite=false)
{
    if (fOverwrite || !fs.existsSync(fileName)) {
        try {
            let dir = path.dirname(fileName);
            if (!fs.existsSync(dir)) {
                mkdirp.sync(dir);
            }
            fs.writeFileSync(fileName, text);
        }
        catch(err) {
            printf("%s\n", err.message);
        }
    } else {
        printf("file already exists: %s\n", fileName);
    }
}

/**
 * readXMLFile(fileName)
 *
 * @param {string} fileName
 * @return {Object}
 */
function readXMLFile(fileName)
{
    let xml;
    let text = readTextFile(fileName);
    if (text != null) {
        parseXML(text, function(err, result) {
            if (err) {
                printf("%s\n", err.message);
                return;
            }
            xml = result;
        });
    }
    return xml;
}

/**
 * readDataCourts()
 *
 * @return {Array.<Court>}
 */
function readDataCourts()
{
    let fixes = 0;
    let courts = JSON.parse(readTextFile(pkg.data.courts));
    for (let i = 0; i < courts.length; i++) {
        let court = courts[i];
        let start = court.start;
        let startFormatted = stdio.formatDate("l, F j, Y", start);
        if (startFormatted != court.startFormatted) {
            printf("%s != %s\n", startFormatted, court.startFormatted);
            court.startFormatted = startFormatted;
            fixes++;
        }
        let stop = court.stop;
        let stopFormatted = stdio.formatDate("l, F j, Y", stop);
        if (stopFormatted != court.stopFormatted) {
            printf("%s != %s\n", stopFormatted, court.stopFormatted);
            court.stopFormatted = stopFormatted;
            fixes++;
        }
        if (i < courts.length - 1) {
            let courtNext = courts[i+1];
            let dateFormatted = stdio.formatDate("l, F j, Y", stdio.adjustDate(new Date(court.stop), 1));
            if (dateFormatted != courtNext.startFormatted) {
                printf("end of %s court (%s) doesn't align with beginning of %s court (%s)\n", court.name, court.stopFormatted, courtNext.name, courtNext.startFormatted);
            }
        }
    }
    if (fixes) {
        printf("writing %d corrections to %s\n", fixes, pkg.data.courts);
        writeTextFile(pkg.data.courts, sprintf("%2j\n", courts), true);
    }
    return courts;
}

/**
 * readOyezCourts()
 *
 * @return {Array.<Court>}
 */
function readOyezCourts()
{
    let courts = [];
    let fileNames = glob.sync(pkg.oyez.courts);
    for (let i = 0; i < fileNames.length; i++) {
        let xml = readXMLFile(fileNames[i]);
        if (!xml) break;
        // printf("%s: %2j\n", fileNames[i], xml);
        let justices = [];
        for (let j = 0; j < xml.court.courtJustice.length; j++) {
            justices.push(xml.court.courtJustice[j].$.id);
        }
        let court = {
            "id": xml.court.courtName[0].$.id,
            "name": xml.court.courtName[0]._,
            "justices": justices,
            "start": xml.court.courtStartDate[0]._,
            "startFormatted": xml.court.courtStartDate[0].$.formatted,
            "stop": xml.court.courtEndDate[0]._,
            "stopFormatted": xml.court.courtEndDate[0].$.formatted,
            "reason": xml.court.courtDefined[0]
        };
        courts.push(court);
    }
    courts.sort(function(a,b) {
        return (a.start < b.start)? -1 : ((a.start > b.start)? 1 : 0);
    });
    return courts;
}

/**
 * readSCDBCourts()
 *
 * @return {Array.<Court>}
 */
function readSCDBCourts()
{
    let courts = parseCSV(readTextFile(pkg.scdb.courts));
    printf("%2j\n", courts);
    return courts;
}

/**
 * buildCourts()
 *
 * @param {function()} done
 */
function buildCourts(done)
{
    let courts = readOyezCourts();
    printf("courts read: %d\n", courts.length);
    let json = sprintf("%2j\n", courts);
    writeTextFile(pkg.data.courts, json);
    courts = readDataCourts();
    courts = readSCDBCourts();
    done();
}

function buildDecisions(done)
{
    let decisions = parseCSV(readTextFile(pkg.scdb.decisions), 0, "voteId", "justice");
    printf("SCDB decisions: %d\n", decisions.length);
    let json = sprintf("%2j\n", decisions);
    writeTextFile(pkg.data.decisions, json);
    done();
}

gulp.task("courts", buildCourts);
gulp.task("default", buildDecisions);
