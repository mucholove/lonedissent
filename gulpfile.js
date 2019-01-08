/**
 * @fileoverview Gulp file for Lone Dissent
 * @author <a href="mailto:Jeff@pcjs.org">Jeff Parsons</a> (@jeffpar)
 * @copyright © Jeff Parsons 2018-2019
 * @license GPL-3.0
 *
 * The following excerpts from "Explanation of certain items in the 'Justices of the Supreme Court' Table"
 * (https://www.thegreenpapers.com/Hx/JusticesExplanation.html) are helpful in understanding the evolution
 * of Supreme Court terms; however, it doesn't touch on any of the "Special Terms" established by the Court
 * from time to time -- a byproduct of the Court's ability to define its own terms, starting in 1911.
 *
 *     "[T]he Supreme Court was to ... meet twice a year, beginning on the first Monday in February
 *      and again on the first Monday in August....  From February 1790, when the Court had its first quorum ...
 *      (though, as the highest appellate court in a new Federal System in which even its lower courts were
 *      still getting themselves organized, there was no judicial business to transact in that very first Term
 *      of Court other than the appointment of clerks and admitting various attorneys to the bar of the Supreme
 *      Court itself), through August 1801, this schedule of Terms of Court was followed."
 *
 *     "[T]he [Judiciary Act of 1801 allowed] the Supreme Court to meet at different times of the year than
 *      heretofore, June and December, beginning in 1802."
 *
 *     "[T]he Judiciary Act of 1802 restored the February Term (to begin on the first Monday in February)
 *      but permanently abolished the August one; from now on, the Supreme Court would meet in annual Terms
 *      of Court instead of twice a year....  [I]t being after February 1802 by the time the new Act became
 *      law (and with no more August Term), the next time the Supreme Court would meet would be February 1803."
 *
 *     "In 1826, ... [t]he only relief for the Justices of the Supreme Court was moving the convening of the
 *      Term of Court up to the second Monday in January: this was in response to complaints that the Supreme
 *      Court had to complete its old February annual term by the end of March in order to give the Justices
 *      time to get out of Washington for Circuit Court duty."
 *
 *     "Similar complaints nearly two decades later (after two new Circuits had been created, mind you!) led
 *      to the Act of 17 June 1844 which would, effective in 1845, move the start of the Court's Term up to
 *      the first Monday in December."
 *
 *     "In 1873, Congress once again changed the start of Terms of the Supreme Court, moving the starting date
 *      up to the second Monday in October to help the Court clear their annual docket of an increasing amount
 *      of cases."
 *
 *     "The 1911 Judicial Code also permitted the Supreme Court to determine its own Terms of Court under its
 *      own rules....  In 1917, the Supreme Court exercised its new authority and moved the start of its Term up
 *      to the present (and rather well-known) first Monday in October."
 *
 * Our own observations, based on examination of selected volumes of U.S. Reports:
 *
 *   1) In 1790, and continuing through 1800, we see Feb and Aug terms; eg:
 *
 *      Feb Term 1790: http://cdn.loc.gov/service/ll/usrep/usrep002/usrep002399/usrep002399.pdf (the Court acknowledges appointments of the first five Justices)
 *      Aug Term 1790: http://cdn.loc.gov/service/ll/usrep/usrep002/usrep002400/usrep002400.pdf (the Court acknowledges appointment of Justice Iredell)
 *      Feb Term 1791: http://cdn.loc.gov/service/ll/usrep/usrep002/usrep002400/usrep002400.pdf (basically just admissions to the bar)
 *      Aug Term 1791: http://cdn.loc.gov/service/ll/usrep/usrep002/usrep002401/usrep002401.pdf (first opinion listed in SCDB)
 *      ...
 *      Feb Term 1800: http://cdn.loc.gov/service/ll/usrep/usrep004/usrep004012/usrep004012.pdf
 *      Aug Term 1800: http://cdn.loc.gov/service/ll/usrep/usrep004/usrep004028/usrep004028.pdf
 *
 *   2) In 1801, we see Aug and Dec terms (no Feb term, and NO terms in 1802):
 *
 *      Aug Term 1801: http://cdn.loc.gov/service/ll/usrep/usrep005/usrep005001/usrep005001.pdf
 *      Dec Term 1801: http://cdn.loc.gov/service/ll/usrep/usrep005/usrep005117/usrep005117.pdf
 *
 *      The presence of a Dec Term 1801 looks like an anomaly, perhaps due to the confusion wrought by
 *      the competing Judiciary Acts of 1801 and 1802.
 *
 *   3) In 1803, and continuing through 1826, we see only Feb terms:
 *
 *      Feb Term 1803: http://cdn.loc.gov/service/ll/usrep/usrep005/usrep005137/usrep005137.pdf (Marbury v. Madison)
 *      ...
 *      Feb Term 1806: http://cdn.loc.gov/service/ll/usrep/usrep007/usrep007241/usrep007241.pdf
 *      ...
 *
 *   4) In 1827, we see the first January term (Jan Term 1827).
 *
 *   5) In 1850, we see the final January term (Jan Term 1850) and the first December term (Dec Term 1850);
 *      technically however, December terms began in 1844.  The Court simply chose to continue calling them
 *      "January" terms until December 1850.  Consequently, there weren't really two terms in 1850, as some
 *      would suggest; I think it's more correct to say there were two terms in 1844, since what's called the
 *      "January 1845" term actually began in December 1844.
 *
 *   6) In 1873, we see the first October Term (Oct Term 1873), beginning on the *second* Monday of October.
 *
 *   7) In 1917, we see the first October Term (Oct Term 1917), beginning on the *first* Monday of October.
 *
 * TODO: Make a list of all "Special Terms" created by the Court (presumably they are all after 1911).
 */

 "use strict";

let glob = require("glob");
let gulp = require("gulp");
let fs = require("fs");
let mkdirp = require("mkdirp");
let path = require("path");
let parseXML = require('xml2js').parseString;

let rootDir = ".";
let datelib = require(rootDir + "/lib/datelib");
let proclib = require(rootDir + "/lib/proclib");
let stdio = require(rootDir + "/lib/stdio");
let printf = stdio.printf;
let sprintf = stdio.sprintf;
let strlib = require(rootDir + "/lib/strlib");

let _data = require(rootDir + "/_data/_data.json");
let sources = require(rootDir + "/sources/sources.json");
let argv = proclib.args.argv;

/**
 * @typedef {object} Justice
 * @property {string} id
 * @property {string} name
 * @property {string} position
 * @property {number} seat
 * @property {string} start
 * @property {string} startFormatted
 * @property {string} stop
 * @property {string} stopFormatted
 * @property {string} stopReason
 * @property {string} photo
 * @property {number} scdbJustice
 */

/**
 * @typedef {object} Court
 * @property {string} id
 * @property {string} name
 * @property {Array.<string>} justices
 * @property {string} start
 * @property {string} startFormatted
 * @property {string} stop
 * @property {string} stopFormatted
 * @property {string} reason
 * @property {string} photo
 */

/**
 * For a complete list of possible values for the following decision variables, see sources/scdb/vars.json.
 *
 * @typedef {object} Decision
 * @property {string} caseId
 * @property {string} docketId
 * @property {string} caseIssuesId
 * @property {string} voteId
 * @property {string} dateDecision
 * @property {number} decisionType
 * @property {string} usCite
 * @property {string} sctCite
 * @property {string} ledCite
 * @property {string} lexisCite
 * @property {number} term
 * @property {number} naturalCourt
 * @property {string} chief
 * @property {string} docket
 * @property {string} caseName
 * @property {string} dateArgument
 * @property {string} dateRearg
 * @property {number} petitioner
 * @property {number} petitionerState
 * @property {number} respondent
 * @property {number} respondentState
 * @property {number} jurisdiction
 * @property {number} adminAction
 * @property {number} adminActionState
 * @property {number} threeJudgeFdc
 * @property {number} caseOrigin
 * @property {number} caseOriginState
 * @property {number} caseSource
 * @property {number} caseSourceState
 * @property {number} lcDisagreement
 * @property {number} certReason
 * @property {number} lcDisposition
 * @property {number} lcDispositionDirection
 * @property {number} declarationUncon
 * @property {number} caseDisposition
 * @property {number} caseDispositionUnusual
 * @property {number} partyWinning
 * @property {number} precedentAlteration
 * @property {number} voteUnclear
 * @property {number} issue
 * @property {number} issueArea
 * @property {number} decisionDirection
 * @property {number} decisionDirectionDissent
 * @property {number} authorityDecision1
 * @property {number} authorityDecision2
 * @property {number} lawType
 * @property {number} lawSupp
 * @property {string} lawMinor
 * @property {number} majOpinWriter
 * @property {number} majOpinAssigner
 * @property {number} splitVote
 * @property {number} majVotes
 * @property {number} minVotes
 * @property {number} justice
 * @property {string} justiceName
 * @property {number} vote
 * @property {number} opinion
 * @property {number} direction
 * @property {number} majority
 * @property {number} firstAgreement
 * @property {number} secondAgreement
 */

 /**
  * checkCharSet(text)
  *
  * @param {string} text
  * @return {boolean} (true if valid, false otherwise)
  */
 function checkCharSet(text)
 {
     let valid = true;
     let lines = text.split(/\r?\n/);
     for (let i = 0; i < lines.length; i++) {
         let line = lines[i];
         for (let j = 0; j < line.length; j++) {
             let ch = line.charCodeAt(j);
             if (ch < 0x20) {
                 printf("warning: control character %02x at row %d col %d: '%s'\n", ch, i+1, j+1, line);
                 valid = false;
             }
         }
     }
     return valid;
 }

/**
 * mapValues(o, vars, strict)
 *
 * @param {object} o
 * @param {Array.<object>} vars
 * @param {boolean} [strict]
 * @return {number}
 */
function mapValues(o, vars, strict)
{
    let changes = 0;
    let keys = Object.keys(o);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (vars[key]) {
            let values = vars[key].values;
            if (values && typeof values == "string") {
                values = vars[values].values;
            }
            if (values && !Array.isArray(values)) {
                let value = values[o[key]];
                if (value !== undefined) {
                    o[key] = value;
                    if (changes >= 0) changes++;
                }
                else if (strict) {
                    if (vars[key].type != "number" || o[key]) {
                        printf("warning: code '%s' for key '%s' has no value\n", o[key], key);
                        changes = -1;
                    }
                }
            }
        }
        else if (Array.isArray(o[key])) {
            for (let j = 0; j < o[key].length; j++) {
                let n = mapValues(o[key][j], vars, strict);
                if (n < 0) {
                    changes = -1;
                } else {
                    changes += n;
                }
            }
        }
        else if (strict) {
            printf("warning: variable '%s' missing\n", key);
            changes = -1;
        }
    }
    return changes;
}

/**
 * searchObjectArray(a, key, value)
 *
 * @param {Array.<object>} a
 * @param {string} key
 * @param {*} value
 * @return {number} (index of position, or -1 if not found)
 */
function searchObjectArray(a, key, value)
{
    let i;
    for (i = 0; i < a.length; i++) {
        if (a[i][key] == value) break;
    }
    return (i < a.length)? i : -1;
}

 /**
  * parseCSV(text, maxRows, keyUnique, keySubset, saveUniqueKey, vars)
  *
  * @param {string} text
  * @param {number} [maxRows] (default is zero, implying no maximum; heading row is not counted toward the limit)
  * @param {string} [keyUnique] (name of field, if any, that should be filtered; typically the key associated with the subset fields)
  * @param {string} [keySubset] (name of first subset field, if any, containing data for unique subsets)
  * @param {boolean} [saveUniqueKey] (default is false, to reduce space requirements)
  * @param {object|null} [vars]
  * @return {Array.<Object>}
  */
function parseCSV(text, maxRows=0, keyUnique="", keySubset="", saveUniqueKey=false, vars=null)
{
    let rows = [];
    let headings, fields;
    let lines = text.split(/\r?\n/);
    let keyChildren = keySubset + 's';
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (!line) continue;
        let row = {};
        let fields = parseCSVFields(line, i+1);
        if (!headings) {
            headings = fields;
            /*
             * Make sure all headings are non-empty and unique.
             */
            for (let h = 0; h < headings.length; h++) {
                let heading = headings[h];
                if (!heading || row[headings[h]] !== undefined) {
                    printf("warning: CSV field heading %d (%s) is invalid or duplicate\n", h, heading);
                    heading = "field" + (h + 1);
                }
                row[heading] = h;
            }
        } else {
            let fieldUnique = "";
            let subset = null, hUnique = -1;
            let matchedPrevious = !!rows.length;
            for (let h = 0; h < headings.length; h++) {
                let field = fields[h];
                let heading = headings[h];
                if (vars) {
                    if (!vars[heading]) {
                        printf("warning: %s field is an undefined type, defaulting to string\n", heading);
                        vars[heading] = {type: "string", dump: true};
                    }
                    if (vars[heading]) {
                        let t = vars[heading];
                        if (field != "") {
                            if (t.dump) {
                                if (!t.values) t.values = [];
                                if (t.values.indexOf(field) < 0) t.values.push(field);
                            }
                            else {
                                let v = t.values;
                                if (v && typeof v == "string") {
                                    v = vars[v].values;
                                }
                                if (v && (Array.isArray(v) && v.indexOf(field) < 0 || !Array.isArray(v) && v[field] === undefined) || !v && field == "NULL") {
                                    if (argv['debug']) {
                                        if (fieldUnique && fieldUnique != "NULL") {
                                            printf("warning: record %s field %s has unexpected value '%s'\n", fieldUnique, heading, field);
                                        } else {
                                            printf("warning: CSV row %d field %s has unexpected value '%s'\n", i+1, heading, field);
                                        }
                                    }
                                }
                            }
                        }
                        if (t.type == "number") {
                            field = +field;
                        } else if (t.type == "date") {
                            if (field) {
                                field = sprintf("%#Y-%#02M-%#02D", field, field, field);
                            }
                        }
                    }
                }
                if (heading == keyUnique) {
                    fieldUnique = field;
                    if (saveUniqueKey) hUnique = h;
                    continue;
                }
                if (heading == keySubset) {
                    subset = {};
                    if (hUnique >= 0) {
                        subset[keyUnique] = fields[hUnique];
                    }
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
                printf("warning: CSV row %d has %d fields, expected %d\n", i+1, fields.length, headings.length);
            }
            if (subset) {
                if (!matchedPrevious) {
                    row[keyChildren] = [];
                    row[keyChildren].push(subset);
                } else {
                    rows[rows.length-1][keyChildren].push(subset);
                    continue;
                }
            }
            if (!maxRows || i <= maxRows) rows.push(row);
        }
    }
    if (vars) {
        for (let key in vars) {
            let t = vars[key];
            if (t.dump) {
                delete t.dump;
                if (vars[key].values) {
                    vars[key].values.sort(function(a, b) {
                        return a.localeCompare(b, 'en', {'sensitivity': 'base'});
                    });
                }
                printf('"%s": %2j\n', key, vars[key]);
            }
        }
    }
    return rows;
}

/**
 * parseCSVFields(line, row)
 *
 * @param {string} line
 * @param {number} [row]
 * @return {Array.<string>}
 */
function parseCSVFields(line, row)
{
    let field = "";
    let fields = [];
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        let ch = line[i];
        if (!inQuotes) {
            if (ch == ',') {
                field = replaceChars(field, row, fields.length + 1);
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
    field = replaceChars(field, row, fields.length + 1);
    fields.push(field);
    if (inQuotes) {
        printf("CSV quote error: %s\n", line);
    }
    return fields;
}

/**
 * replaceChars(text, row, col)
 *
 * @param {string} text
 * @param {number} [row]
 * @param {number} [col]
 * @return {string}
 */
function replaceChars(text, row, col)
{
    let textNew = "";
    for (let i = 0; i < text.length; i++) {
        let c = text.charCodeAt(i);
        switch(c) {
        case 0x91:
            textNew += "&lsquo;"
            break;
        case 0x92:
            textNew += "&rsquo;"
            break;
        case 0x93:
            textNew += "&ldquo;"
            break;
        case 0x94:
            textNew += "&rdquo;"
            break;
        case 0x96:
            textNew += "&ndash;"
            break;
        case 0xA7:
            textNew += "&sect;"
            break;
        default:
            if (c >= 0x7f) {
                printf("warning: field '%s' contains unrecognized character '%c' (0x%02x) in row %d, col %d, pos %d\n", text, c, c, row, col, i + 1);
                break;
            }
            textNew += String.fromCharCode(c);
            break;
        }
    }
    return textNew.replace(/&([^&;]*)( |$)/gi, "&amp;$1$2").replace(/&amp;C\.?/g, "ETC.").replace(/&amp;c\.?/g, "etc.");
}

/**
 * readTextFile(fileName, encoding, conversion)
 *
 * @param {string} fileName
 * @param {string} [encoding] (default is "utf-8")
 * @param {string} [conversion] (default is "utf-8")
 * @return {string|undefined}
 */
function readTextFile(fileName, encoding="utf-8", conversion="utf-8")
{
    let text;
    try {
        text = fs.readFileSync(fileName, encoding);
        checkCharSet(text);
    }
    catch(err) {
        printf("%s\n", err.message);
    }
    return text;
}

/**
 * writeTextFile(fileName, text, fOverwrite, fQuiet)
 *
 * @param {string} fileName
 * @param {string|object} text (if you pass an object, we automatically "stringify" it into JSON)
 * @param {boolean} [fOverwrite] (default is false)
 * @param {boolean} [fQuiet] (default is false)
 */
function writeTextFile(fileName, text, fOverwrite=false, fQuiet=false)
{
    if (typeof text == "object") {
        text = sprintf("%2j\n", text);
        checkCharSet(text);
    }
    if (fOverwrite || !fs.existsSync(fileName)) {
        try {
            let dirName = path.dirname(fileName);
            if (!fs.existsSync(dirName)) mkdirp.sync(dirName);
            fs.writeFileSync(fileName, text);
        }
        catch(err) {
            printf("%s\n", err.message);
        }
    } else {
        if (!fQuiet) printf("file %s already exists, use --overwrite to recreate\n", fileName);
    }
}

/**
 * readXMLFile(fileName)
 *
 * @param {string} fileName
 * @return {object}
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
 * readCourts()
 *
 * @return {Array.<Court>}
 */
function readCourts()
{
    let fixes = 0;
    let courts = JSON.parse(readTextFile(rootDir + sources.results.courts));
    /*
     * First, let's see how our data lines up with current Oyez HTML data.
     */
    let html = readTextFile(rootDir + sources.oyez.courtsHTML);
    let reCourt = /lazy-img="([^"]*)"\s+alt="([^"]*)"/g, match;
    while ((match = reCourt.exec(html))) {
        let i, matched = false;
        let name = match[2].replace(/\s+/g, " ");
        for (i = courts.length - 1; i >= 0; i--) {
            if (courts[i].name == name) {
                matched = true;
                if (!courts[i].photo) {
                    courts[i].photo = path.join(rootDir, path.dirname(sources.oyez.courtsHTML), path.basename(sources.oyez.courtsHTML, ".html"), path.basename(match[1]));
                    fixes++;
                    break;
                }
            }
        }
        if (!matched) {
            printf("warning: unable to find HTML court '%s' in XML courts\n", name);
        }
    }
    /*
     * Next, let's see how our data lines up with itself.
     */
    for (let i = 0; i < courts.length; i++) {
        let court = courts[i];
        let start = court.start;
        if (court.photo) {
            let name = path.basename(court.photo, ".jpg");
            if (court.id != name) {
                court.id = name;
                fixes++;
            }
        }
        let startFormatted = sprintf("%#C", start);
        if (startFormatted != court.startFormatted) {
            printf("%s != %s\n", startFormatted, court.startFormatted);
            court.startFormatted = startFormatted;
            fixes++;
        }
        if (court.stop) {
            let stop = court.stop;
            let stopFormatted = sprintf("%#C", stop);
            if (stopFormatted != court.stopFormatted) {
                printf("%s != %s\n", stopFormatted, court.stopFormatted);
                court.stopFormatted = stopFormatted;
                fixes++;
            }
        }
        if (i < courts.length - 1) {
            let courtNext = courts[i+1];
            let date = datelib.adjustDate(new Date(court.stop), 1);
            let dateFormatted = sprintf("%#C", date);
            if (dateFormatted != courtNext.startFormatted) {
                printf("end of %s court (%s) doesn't align with beginning of %s court (%s)\n", court.name, court.stopFormatted, courtNext.name, courtNext.startFormatted);
            }
        }
        if (!court.photoSmall) {
            let fileName = path.join("data/oyez/courts", court.id, "image-small.jpg");
            if (fs.existsSync(fileName)) {
                court.photoSmall = fileName;
                fixes++;
            }
        }
        if (!court.photoLarge) {
            let fileName = path.join("data/oyez/courts", court.id, "image-large.jpg");
            if (fs.existsSync(fileName)) {
                court.photoLarge = fileName;
                fixes++;
            }
        }
    }
    if (fixes) {
        printf("writing %d corrections to %s\n", fixes, rootDir + sources.results.courts);
        writeTextFile(rootDir + sources.results.courts, courts, argv['overwrite']);
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
    let fileNames = glob.sync(rootDir + sources.oyez.courtsXML);
    for (let i = 0; i < fileNames.length; i++) {
        let xml = readXMLFile(fileNames[i]);
        if (!xml) break;
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
 * readOyezJustices()
 *
 * @return {Array.<Justice>}
 */
function readOyezJustices()
{
    let justices = [];
    let fileNames = glob.sync(rootDir + sources.oyez.justicesXML);
    for (let i = 0; i < fileNames.length; i++) {
        let xml = readXMLFile(fileNames[i]);
        if (!xml) break;
        for (let j = 0; j < xml.justice.justiceAppointment.length; j++) {
            let justice = {};
            justice.id = xml.justice.justiceName[0].$.id;
            justice.name = xml.justice.justiceName[0]._;
            let xmlAppt = xml.justice.justiceAppointment[j];
            justice.position = xmlAppt.justicePosition[0];
            justice.seat = +xmlAppt.justiceSeat[0];
            /*
             * For some reason, all the Oyez XML justice dates appear to be off-by-one, so we compensate here.
             */
            let date = datelib.adjustDate(new Date(xmlAppt.justiceSwornDate[0]._), 1);
            justice.start = sprintf("%#Y-%#02M-%#02D", date, date, date);
            justice.startFormatted = sprintf("%#C", justice.start);
            if (xmlAppt.justiceEndDate) {
                date = datelib.adjustDate(new Date(xmlAppt.justiceEndDate[0]._), 1);
                justice.stop = sprintf("%#Y-%#02M-%#02D", date, date, date);
                justice.stopFormatted = sprintf("%#C", justice.stop);
                if (xmlAppt.justiceReasonForLeaving) {
                    justice.stopReason = xmlAppt.justiceReasonForLeaving[0];
                } else {
                    printf("warning: justice '%s' stopped for no reason\n", justice.name);
                }
            }
            justices.push(justice);
        }
    }
    justices.sort(function(a,b) {
        return (a.start < b.start)? -1 : ((a.start > b.start)? 1 : 0);
    });
    return justices;
}

/**
 * readSCDBCourts()
 *
 * @return {Array.<Court>}
 */
function readSCDBCourts()
{
    let courts = parseCSV(readTextFile(rootDir + sources.scdb.courtsCSV));
    for (let i = 0; i < courts.length; i++) {
        let court = courts[i];
        let start = new Date(court.naturalStart);
        let stop = new Date(court.naturalStop);
        court.start = sprintf("%#Y-%#02M-%#02D", start, start, start);
        court.stop = sprintf("%#Y-%#02M-%#02D", stop, stop, stop);
        court.startFormatted = sprintf("%#C", start);
        court.stopFormatted = sprintf("%#C", stop);
    }
    return courts;
}

/**
 * buildCourts()
 *
 * @param {function()} done
 */
function buildCourts(done)
{
    /*
     * Now that we've edited courts.json, we no longer want to rebuild it.
     *
     *      let courtsOyez = readOyezCourts();
     *      printf("Oyez courts read: %d\n", courtsOyez.length);
     *      writeTextFile(rootDir + sources.results.courts, courtsOyez, argv['overwrite']);
     */
    let courts = readCourts();
    printf("courts read: %d\n", courts.length);

    /*
     * Let's verify that all the justices are appropriately slotted into the courts.
     */
    let lastCourtPrinted = "";
    let justices = JSON.parse(readTextFile(rootDir + sources.results.justices));
    for (let i = 0; i < justices.length; i++) {
        let justice = justices[i];
        let nCourts = 0;
        for (let j = 0; j < courts.length; j++) {
            let court = courts[j];
            if (justice.start >= court.start && (!court.stop || justice.start <= court.stop)) {
                let nDays = datelib.subtractDates(justice.start, court.start);
                if (lastCourtPrinted != court.id) {
                    if (nDays) printf("court %s: justice %s started within %d days\n", court.id, justice.name, nDays);
                    lastCourtPrinted = court.id;
                }
                nCourts++;
            }
        }
        if (nCourts != 1) {
            printf("warning: justice %s started in %d courts\n", justice.name, nCourts);
        }
    }

    /*
     * Now walk the courts data, interleaving the courtsSCDB data, to produce a reconciliation spreadsheet.
     */
    let courtsSCDB = readSCDBCourts();
    printf("SCDB courts read: %d\n", courtsSCDB.length);
    let j = 0;
    let csv = sprintf('"reconcileDB","reconcileName","reconcileStart","reconcileStop"\n');
    for (let i = 0; i <= courts.length; i++) {
        let court = courts[i];
        if (court) csv += sprintf('"OYEZ","%s","%s","%s"\n', court.name, court.startFormatted, court.stopFormatted);
        while (j < courtsSCDB.length) {
            if (court && courtsSCDB[j].start > court.stop) break;
            let courtSCDB = courtsSCDB[j];
            csv += sprintf('"SCDB","%s","%s","%s"\n', courtSCDB.naturalName, courtSCDB.startFormatted, courtSCDB.stopFormatted);
            j++;
        }
    }

    writeTextFile(rootDir + sources.results.courtsCSV, csv, argv['overwrite']);
    done();
}

/**
 * backupLonerDecisions()
 *
 * @param {function()} done
 */
function backupLonerDecisions(done)
{
    let backupDecisions = [];
    let backupKeys = ['caseId', 'termId', 'dissenterId', 'dissenterName', 'caseNotes', 'pdfSource', 'pdfPage', 'pdfPageDissent'];
    let lonerDecisions = JSON.parse(readTextFile(rootDir + _data.lonerDecisions));
    lonerDecisions.forEach((decision) => {
        let backup = {};
        backupKeys.forEach((key) => {
            if (decision[key]) backup[key] = decision[key];
        });
        backupDecisions.push(backup);
    });
    writeTextFile(rootDir + _data.lonerBackup, backupDecisions, argv['overwrite']);
    done();
}

/**
 * buildDecisions()
 *
 * @param {function()} done
 */
function buildDecisions(done)
{
    let vars = JSON.parse(readTextFile(rootDir + sources.scdb.vars));
    let decisions = parseCSV(readTextFile(rootDir + sources.scdb.decisionsCSV, "latin1"), 0, "voteId", "justice", false, vars);
    printf("SCDB decisions: %d\n", decisions.length);
    writeTextFile(rootDir + sources.results.decisions, decisions, argv['overwrite']);
    done();
}

/**
 * buildJustices()
 *
 * @param {function()} done
 */
function buildJustices(done)
{
    let justicesOyez = readOyezJustices();
    printf("Oyez justices read: %d\n", justicesOyez.length);

    let justices = parseCSV(readTextFile(rootDir + sources.scdb.justicesCSV));
    printf("SCDB justices read: %d\n", justices.length);
    for (let i = 0; i < justices.length; i++) {
        let first, last;
        let justice = justices[i];
        let match = justice.name.match(/(.*),\s*(.*)/);
        if (match) {
            first = match[2];
            last = match[1];
            justice.name =  first + ' ' + last;
        }
        let start = new Date(justice.startDate);
        let stop = new Date(justice.stopDate);
        delete justice.startDate;
        delete justice.stopDate;
        justice.start = sprintf("%#Y-%#02M-%#02D", start, start, start);
        justice.startFormatted = sprintf("%#C", start);
        justice.stop = sprintf("%#Y-%#02M-%#02D", stop, stop, stop);
        justice.stopFormatted = sprintf("%#C", stop);
        /*
         * Let's see if we can find a match in the Oyez list...
         */
        let j;
        let missing = true;
        for (j = 0; j < justicesOyez.length; j++) {
            let oyez = justicesOyez[j];
            /*
             * OYEZ uses "Brockholst Livingston" and "Frank Murphy",
             * whereas SCDB uses "Henry Livingston" and "Francis Murphy", so we need some variances.
             */
            if (oyez.name.indexOf(last) >= 0 && (oyez.name.indexOf(first) >= 0 || first == "Francis" || first == "Henry")) {
                missing = false;
                if (oyez.start == justice.start) {
                    oyez.scdbJustice = +justice.index;
                    break;
                } else {
                    printf("warning: SCDB justice '%s' date (%s) doesn't match OYEZ justice '%s' date (%s)\n", justice.name, justice.start, oyez.name, oyez.start);
                }
            }
        }
        if (missing) {
            // printf("warning: unable to find SCDB justice '%s' (%d) in OYEZ\n", justice.name, justice.index)
            justice.scdbJustice = +justice.index;
            delete justice.index;
            justicesOyez.push(justice);
        }
    }
    writeTextFile(rootDir + sources.results.justices, justicesOyez, argv['overwrite']);
    done();
}

/**
 * getJusticeId(id)
 *
 * @param {string} id
 * @return {string} ("normalized" ID)
 */
function getJusticeId(id)
{
    if (id) {
        if (id == "CEHughes1" || id == "CEHughes2") id = "CEHughes";
        id = id.toLowerCase();
    }
    return id;
}

/**
 * getTermDate(term, termDelta, dayDelta, fPrint)
 *
 * @param {string} term (yyyy-mm, or yyyy if you're lazy, but that's not allowed for years with multiple terms)
 * @param {number} [termDelta]
 * @param {number} [dateDelta]
 * @param {boolean} [fPrint]
 * @return {string} (yyyy-mm-dd)
 */
function getTermDate(term, termDelta = 0, dateDelta = 0, fPrint = false)
{
    let sDate = "";
    let year = +term.substr(0, 4) || 0;
    let month = +term.substr(5, 2) || 0;
    if (year) {
        let weekday;            // target weekday (0 == Sunday, 1 == Monday, etc)
        let firstDate;          // first date of the month (bumped from 1 to 8 when we must find the *second* target weekday of the month)
        do {
            if (year >= 1917) {
                /*
                 * You might think that 1917 to present would be simplest (first Monday of October to first Monday of the following October),
                 * and it is, except for those pesky "special terms"....
                 */
                weekday = 1;
                firstDate = 1;
                if (!month) {
                    month = 10;
                }
                else if (month < 10 && termDelta) {
                    month = 10;
                    termDelta--;
                }
                else if (month != 10) {
                    if (year == 1942 || year == 1953 || year == 1958 || year == 1972) {
                        weekday = -1;
                        if (year == 1953) firstDate = 18;
                    } else {
                        month = 0;
                    }
                }
                if (termDelta) {
                    year++;
                    termDelta--;
                    if (year == 1942) {
                        month = 7;
                        weekday = -1;
                    } else if (year == 1953) {
                        month = 6;
                        firstDate = 18;
                        weekday = -1;
                    } else if (year == 1958) {
                        month = 8;
                        weekday = -1;
                    } else if (year == 1972) {
                        month = 7;
                        weekday = -1;
                    }
                }
            } else if (year >= 1873) {
                weekday = 1;
                firstDate = 8;
                if (!month) month = 10;
                if (month != 10) month = 0;
                if (termDelta) year++;
            } else if (year >= 1844) {
                weekday = 1;
                firstDate = 1;
                if (year > 1844) {
                    if (!month) month = 12;
                    if (month != 12) month = 0;
                } else {
                    if (month != 1 && month != 12) month = 0;
                    if (termDelta && month == 1) {
                        month = 12;
                        termDelta--;
                    }
                }
                if (termDelta) {
                    if (++year == 1873) month = 10;
                }
            } else if (year >= 1827) {
                weekday = 1;
                firstDate = 8;
                if (!month) month = 1;
                if (month != 1) month = 0;
                if (termDelta) {
                    if (++year == 1844) month = 1;
                }
            } else if (year >= 1803) {
                weekday = 1;
                firstDate = 1;
                if (!month) month = 2;
                if (month != 2) month = 0;
                if (termDelta) {
                    if (++year == 1827) month = 1;
                }
            } else if (year >= 1801) {
                weekday = 1;
                firstDate = 1;
                if (month != 8 && month != 12) month = 0;
                if (termDelta && month) {
                    if (month == 8) {
                        month = 12;
                    } else {
                        month = 8;
                        if (++year == 1803) month = 2;
                    }
                    termDelta--;
                }
            } else if (year >= 1790 && year < 1801) {
                weekday = 1;
                firstDate = 1;
                if (month != 2 && month != 8) month = 0;
                if (termDelta && month) {
                    if (month == 2) {
                        month = 8;
                    } else {
                        month = 2;
                        if (++year == 1801) month = 8;
                    }
                    termDelta--;
                }
            }
        } while (month && termDelta--);
        if (month) {
            let add = 0;
            let date = new Date(Date.UTC(year, month - 1, firstDate));
            if (weekday >= 0) {
                let day = date.getUTCDay();
                if (day <= weekday) {
                    add = weekday - day;
                } else {
                    add = 7 - (day - weekday);
                }
            }
            date = datelib.adjustDate(date, add + dateDelta);
            sDate = sprintf("%#Y-%#02M-%#02D", date, date, date);
            if (fPrint) printf("term %s: %s\n", dateDelta? "ending" : term, sprintf("%#C", date));
        }
    }
    return sDate;
}

/**
 * getTermName(termId)
 *
 * Makes accomodations for terms the Court named inconsistently for 6 years after the June 17, 1844 statute,
 * which changed the start of terms from second Monday of January to first Monday of the preceding December; also
 * deals with all known "special terms".
 *
 * @param {string} termId
 */
function getTermName(termId)
{
    let termName = sprintf("%#F Term %#Y", termId, termId);
    if (termId >= "1844-12" && termId <= "1849-12") {
        termName = "January Term " + (+termId.substr(0, 4) + 1);
    } else if (termId == "1942-07" || termId == "1953-06" || termId == "1958-08" || termId == "1972-07") {
        termName = sprintf("%#F Special Term %#Y", termId, termId);
    }
    return termName;
}

/**
 * findDecisions()
 *
 * You can use the "--start" and "--stop" options within this task to extract subsets of the decision data
 * (ie, by dateDecision); both dates are inclusive:
 *
 *      gulp --start=yyyy-mm-dd --stop=yyyy-mm-dd
 *
 * For example, this command:
 *
 *      gulp --start=1823-09-01 --stop=1824-02-09
 *
 * helps us determine if any decisions were handed down during the first 5+ months of the 'marshall12' court,
 * before Justice Smith Thompson joined (if we assume he didn't join until Feb 10, 1824).
 *
 * The "--term" option defines prescribed periods of time (that is, predefined "--start" and "--stop" values);
 * you should specify both a year and month (eg, 1790-02, 1790-08, 1844-01, 1844-12, etc).  You should no longer
 * use *just* a year to identify a particular term, in large part because the earliest years (1790 through 1801)
 * had two terms, and in small part because the Court (since 1911) has had the abilty to define its own terms,
 * including the occasional "special term" (eg, 1953-06).  Special terms are rare and usually occur in the summer,
 * after the Court has recessed but before the next October term has begun.  If you omit the month, the default
 * month for that year will be selected, unless there were multiple terms that year.
 *
 * Also, starting in 1844, terms technically began in December, but the Court still referred to them as "January" terms;
 * in 1850, after the "January 1850" term (which we identify as 1849-12), they finally changed the naming convention,
 * so what would have next been called the "January 1851" term was properly called the December 1850 term (1850-12).
 * This makes it *seem* as if there were two terms in 1850, but it's more accurate to say there were two terms in 1844,
 * when the change actually occurred (specifically, 1844-01 and 1844-12).
 *
 * The "--end" option accepts a term identifier as well; if specified along with "--term", then all terms from the
 * starting term through the ending term will be processed.
 *
 * The "--argued" option allows you to find any cases argued on the specified date (yyyy-mm-dd), month (yyyy-mm),
 * or year (yyyy).  Any matching cases are printed with the argument (or reargument) date, rather than the decision date.
 *
 * The "--decided" option works just like "--argued" but for decision dates.  It's a convenience option, since the
 * same could be accomplished with appropriate "--start" and "--stop" values, but it's less work.
 *
 * The "--month" option allows you to find cases that were decided in a particular month, optionally subject to start
 * and stop values as well.  This is useful for looking for cases that were argued in the summer (ie, potential "Special
 * Term" candidates), for example.
 *
 * The "--volume" and "--page" options allow you to further restrict results to a specific U.S. Reports volume number,
 * page number, or both; use both when looking for a specific citation; for example, to locate the decision reported as
 * "542 U.S. 241", use:
 *
 *      gulp --volume=542 --page=241
 *
 * The "--text" option allows you to search for strings in the caseName variable.  It can be repeated on the command-line
 * if you want to perform multiple "AND" searches.
 *
 * NOTE: You must now specify the "--build" option to generate site files.
 *
 * @param {function()} done
 * @param {number} [minVotes] (0 or undefined for no minimum vote requirement)
 * @param {string} [sTerm]
 * @param {string} [sEnd]
 */
function findDecisions(done, minVotes, sTerm = "", sEnd = "")
{
    let caseId = argv['case'] || "";
    let term = argv['term'] || sTerm, termId;
    let end = argv['end'] || sEnd, endTerm;
    if (end) endTerm = getTermDate(end);
    let decided = argv['decided'], argued = argv['argued'];
    let start = argv['start'] || "", stop = argv['stop'] || "";
    let month = argv['month'] && sprintf("-%02d-", +argv['month']) || "";
    let volume = argv['volume'] || "", page = argv['page'] || "", usCite = sprintf("%s U.S. %s", volume, page);

    let text = argv['text'] || "";
    let findText = function(target) {
        let exists = false;
        if (text) {
            target = target.toLowerCase();
            if (Array.isArray(text)) {
                exists = true;
                for (let i = 0; i < text.length; i++) {
                    if (target.indexOf(text[i]) < 0) {
                        exists = false;
                        break;
                    }
                }
            } else {
                if (target.indexOf(text) >= 0) exists = true;
            }
        }
        return exists;
    };

    let decisionsAudited = [];
    let decisionsDuplicated = [];
    let decisions = JSON.parse(readTextFile(rootDir + sources.results.decisions));
    printf("decisions available: %d\n", decisions.length);
    let lonerBackup = JSON.parse(readTextFile(rootDir + _data.lonerBackup) || "[]");

    let dataFile = minVotes == 1? _data.lonerDecisions : _data.allDecisions;
    let data = JSON.parse(readTextFile(rootDir + dataFile) || "[]");
    let vars = JSON.parse(readTextFile(rootDir + sources.scdb.vars) || "{}");

    do {
        let year = 0;
        if (term) {
            if (termId) {
                term = getTermDate(termId, 1).substr(0, 7);
            }
            year = +term.substr(0, 4) || 0;
            start = getTermDate(term, 0, 0, true);
            stop = getTermDate(term, 1, -1, true);
            if (!start || !stop) {
                printf("unrecognized term (%s)%s\n", term, term.length == 4? ", try including a month (eg, 1790-02)" : "");
                break;
            }
            if (end && !endTerm) {
                printf("unrecognized end term (%s)%s\n", end, end.length == 4? ", try including a month (eg, 1790-08)" : "");
                break;
            }
            termId = start.substr(0, 7);
            printf("\nprocessing term %s...\n", termId);
        }
        let results = [];
        decisions.forEach((decision) => {
            if (!caseId || decision.caseId == caseId) {
                if (!minVotes || decision.minVotes == minVotes) {
                    if (!decided || decision.dateDecision.indexOf(decided) == 0) {
                        if ((!start || decision.dateDecision >= start) && (!stop || decision.dateDecision <= stop)) {
                            if (!month || decision.dateDecision.indexOf(month) > 0) {
                                if (!volume || !page && decision.usCite.indexOf(usCite) == 0 || volume && page && decision.usCite == usCite) {
                                    if (!text || findText(decision.caseName)) {
                                        let datePrint = decision.dateDecision;
                                        if (!argued || (datePrint = decision.dateArgument).indexOf(argued) == 0 || (datePrint = decision.dateRearg).indexOf(argued) == 0) {
                                            printf("%s: %s [%s] (%s): %d-%d\n", datePrint, decision.caseName, decision.docket, decision.usCite, decision.majVotes, decision.minVotes);
                                            results.push(decision);
                                            if (decisionsAudited.indexOf(decision.caseId) < 0) {
                                                decisionsAudited.push(decision.caseId);
                                            } else {
                                                decisionsDuplicated.push(decision.caseId);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        let range = (start || stop)? sprintf(" in range %s--%s", start, stop) : "";
        let condition = minVotes? sprintf(" with minVotes of %d", minVotes) : "";
        printf("decisions%s%s: %d\n", range, condition, results.length);

        if (results.length) {
            let nAdded = 0;
            vars['caseNotes'] = {"type": "string"};
            vars['pdfSource'] = {"type": "string"};
            vars['pdfPage'] = {"type": "number"};
            vars['pdfPageDissent'] = {"type": "number"};
            for (let r = 0; r < results.length; r++) {
                let result = results[r]
                /*
                 * NOTE: Even if mapValues() returns an error (< 0), we now continue processing cases.
                 *
                 * Here's a list of suspect cases; not only did they contain one or more unknown values, but their votes were "0-0".
                 *
                 *      unable to find caseId '1918-233' in data set
                 *      unable to find caseId '1931-152' in data set
                 *      unable to find caseId '1915-245' in data set
                 *      unable to find caseId '1908-203' in data set
                 *      unable to find caseId '1898-184' in data set
                 *      unable to find caseId '1896-274' in data set
                 *      unable to find caseId '1922-231' in data set
                 *      unable to find caseId '1898-187' in data set
                 *      unable to find caseId '1901-204' in data set
                 *      unable to find caseId '1898-189' in data set
                 *      unable to find caseId '1911-251' in data set
                 *      unable to find caseId '1898-186' in data set
                 *      unable to find caseId '1897-224' in data set
                 *      unable to find caseId '1898-185' in data set
                 *      unable to find caseId '1898-188' in data set
                 *      unable to find caseId '1909-178' in data set
                 *      unable to find caseId '1909-179' in data set
                 *      unable to find caseId '1909-177' in data set
                 *      unable to find caseId '1916-217' in data set
                 *      unable to find caseId '1900-201' in data set
                 *      unable to find caseId '1900-202' in data set
                 *      unable to find caseId '1917-218' in data set
                 *      unable to find caseId '1901-202' in data set
                 *      unable to find caseId '1901-203' in data set
                 *      unable to find caseId '1919-181' in data set
                 */
                mapValues(result, vars, true);
                let i = searchObjectArray(data, "caseId", result.caseId);
                if (i < 0) {
                    if (termId) result['termId'] = termId;
                    if (minVotes == 1) {
                        /*
                         * Determine who the lone dissenter is now.
                         */
                        let dissenterId = "", dissenterName = "";
                        for (let i = 0; i < result.justices.length; i++) {
                            let justice = result.justices[i];
                            if (justice.vote == "dissent") {
                                if (!dissenterId) {
                                    dissenterId = justice.justice;
                                    dissenterName = justice.justiceName;
                                } else {
                                    printf("warning: case %s (%s) has multiple dissents (eg, %s, %s)\n", result.caseId, result.usCite, dissenterName, justice.justiceName);
                                }
                            }
                        }
                        if (dissenterId) {
                            result['dissenterId'] = dissenterId;
                            result['dissenterName'] = dissenterName;
                        } else {
                            printf("warning: unable to identify dissenter for case %s (%s)\n", result.caseId, result.usCite);
                        }
                    }
                    let b = searchObjectArray(lonerBackup, "caseId", result.caseId);
                    if (b >= 0) {
                        let backup = lonerBackup[b];
                        if (backup['caseNotes']) result['caseNotes'] = backup['caseNotes'];
                        if (backup['pdfSource']) result['pdfSource'] = backup['pdfSource'];
                        if (backup['pdfPage']) result['pdfPage'] = backup['pdfPage'];
                        if (backup['pdfPageDissent']) result['pdfPageDissent'] = backup['pdfPageDissent'];
                    }
                    if (!result['pdfSource']) {
                        if (year < 2004) {
                            result['pdfSource'] = "loc";            // ie, Library of Congress
                        } else if (year < 2012) {
                            result['pdfSource'] = "scotusBound";    // ie, supremecourt.gov, in the "Bound Volumes" folder
                        } else {
                            result['pdfSource'] = "slipopinion/" + (year % 100);
                        }
                    }
                    data.push(result);
                    nAdded++;
                } else {
                    let citation = (result.usCite || ('No. ' + result.docket));
                    if (argv['debug']) {
                        printf("warning: %s (%s) already exists in %s\n", result.caseId, citation, dataFile);
                    }
                    if (mapValues(data[i], vars) > 0) {
                        printf("warning: %s (%s) being updated in %s\n", result.caseId, citation, dataFile);
                        nAdded++;
                    }
                    results[r] = data[i];
                }
            }
            if (nAdded) {
                writeTextFile(rootDir + dataFile, data, true);
            }
            if (argv['build'] && term) {
                /*
                 * Create a page for each term of decisions that doesn't already have one (eg, _pages/loners/yyyy-mm.md)
                 */
                let category = minVotes == 1? "loners" : "all";
                let termName = getTermName(termId);
                let pathName = "/cases/" + category + "/" + termId;
                let fileName = "/_pages" + pathName + ".md";
                let fileText = '---\ntitle: "' + termName + '"\npermalink: ' + pathName + '\nlayout: cases\n';
                fileText += 'cases:\n';
                results.forEach((result) => {
                    let volume = 0, page = 0;
                    let matchCite = result.usCite.match(/^([0-9]+)\s*U\.?\s*S\.?\s*([0-9]+)$/);
                    if (matchCite) {
                        volume = +matchCite[1];  page = +matchCite[2];
                    }
                    fileText += '  - id: "' + result.caseId + '"\n';
                    fileText += '    termId: "' + result.termId + '"\n';
                    fileText += '    title: "' + result.caseName + '"\n';
                    /*
                     * The source of an opinion PDF varies.  For LOC (Library of Congress) opinions, the 'pdfSource'
                     * should be set to "loc".  When using SCOTUS bound volume PDFs, 'pdfSource' should be "scotusBound".
                     * And finally, when using SCOTUS slip opinions, 'pdfSource' should be a path relative to their
                     * slip opinions URL (eg, "17pdf/17-21_p8k0").
                     *
                     * The LOC appears to have PDFs for everything up through U.S. Reports volume 542, which covers
                     * the end of the 2003 term.  SCOTUS has bound volumes for U.S. Reports volumes 502 through 569,
                     * which spans terms 1991 through 2012, so there's a healthy overlap between LOC and SCOTUS.
                     *
                     * SCOTUS also has slip opinions for the 2012 term and up.  Moreover, SCOTUS claims it will keep
                     * slip opinions until they have been posted in a bound volume PDF.  This means that going forward,
                     * every new SCOTUS opinion will have a SCOTUS source (ie, bound or slip); unfortunately, it also
                     * means that periodically (ie, whenever SCOTUS decides to post a new bound volume PDF and remove
                     * corresponding slip opinion PDFs) we will have to detect the missing opinions and remap them.
                     * Sigh.
                     *
                     * Regarding LOC, you can browse an entire volume like so:
                     *
                     *      https://www.loc.gov/search/?fa=partof:u.s.+reports:+volume+542
                     *
                     * For a case like 542 U.S. 241, the PDF is here:
                     *
                     *      https://cdn.loc.gov/service/ll/usrep/usrep542/usrep542241/usrep542241.pdf
                     *
                     * and the thumbnail is here:
                     *
                     *      https://cdn.loc.gov/service/ll/usrep/usrep542/usrep542241/usrep542241.gif
                     *
                     * Some of the LOC PDFs don't actually start on the correct page.  The above PDF, for example,
                     * actually starts with page 240 of volume 542, not page 241.  Such cases should have the 'pdfPage'
                     * property set (eg, 2); the default value for 'pdfPage' is 1, so it need not be set for PDFs
                     * where the opinion properly begins on the first page (hopefully the case for most LOC opinions).
                     *
                     * As for the dissents, they invariably start at some later page in the PDF, so the 'pdfPageDissent'
                     * property must be set.  Moreover, if the 'pdfPage' is some value greater than 1, then that difference
                     * must be applied to 'pdfPageDissent' as well; our page templates will *not* automatically add
                     * "pdfpage" minus 1 to the dissent page number.
                     */
                    if (volume) fileText += sprintf('    volume: "%03d"\n', volume);
                    if (page) fileText += sprintf('    page: "%03d"\n' , page);
                    if (result.pdfSource) fileText += '    pdfSource: "' + result.pdfSource + '"\n';
                    if (result.pdfPage) fileText += '    pdfPage: ' + result.pdfPage + '\n';
                    if (result.pdfPageDissent) fileText += '    pdfPageDissent: ' + result.pdfPageDissent + '\n';
                    fileText += '    dateDecision: "' + sprintf("%#C", result.dateDecision) + '"\n';
                    fileText += '    citation: "' + (result.usCite || ('No. ' + result.docket)) + '"\n';
                    if (result.dissenterId) {
                        fileText += '    dissenterId: "' + getJusticeId(result.dissenterId) + '"\n';
                        fileText += '    dissenterName: "' + result.dissenterName + '"\n';
                    } else if (result.majOpinWriter && result.majOpinWriter != "none") {
                        fileText += '    authorId: "' + getJusticeId(result.majOpinWriter) + '"\n';
                        fileText += '    authorName: "' + vars.justiceName.values[result.majOpinWriter] + '"\n';
                    }
                });
                fileText += '---\n';
                writeTextFile(rootDir + fileName, fileText, argv['overwrite']);
                /*
                 * Let's make sure there's an index entry as well....
                 */
                fileName = "/_pages/cases/" + category + ".md";
                let index = readTextFile(rootDir + fileName);
                if (index) {
                    let re = /^- \[.*?Term.*?\]\(\/cases\/[a-z]+\/([0-9-]+)\).*$/gm, match;
                    while ((match = re.exec(index))) {
                        if (match[1] >= termId) break;
                    }
                    if (match) {
                        let asterisks = "";
                        if (termId >= "1844-12" && termId <= "1849-12") {
                            asterisks = "*";
                        }
                        let entry = sprintf("- [%s](/cases/%s/%s)%s (%d %s%s)\n", termName, category, termId, asterisks, results.length, category == "loners"? "dissent" : "opinion", results.length == 1? '' : 's');
                        if (match[1] != termId) {
                            index = index.substr(0, match.index) + entry + index.substr(match.index);
                        } else {
                            index = index.substr(0, match.index) + entry + index.substr(match.index + match[0].length + 1);
                        }
                        writeTextFile(rootDir + fileName, index, argv['overwrite']);
                    }
                }
            }
        }
    } while (term && endTerm && start < endTerm);

    printf("matched %d decisions out of %d total\n", decisionsAudited.length, decisions.length);

    if (decisionsDuplicated.length) {
        printf("checked %d decisions more than once (%j)\n", decisionsDuplicated.length, decisionsDuplicated);
    }
    done();
}

/**
 * findLonerDecisions()
 *
 * @param {function()} done
 */
function findLonerDecisions(done)
{
    findDecisions(done, 1, '1790-02', '2017-10');
}

/**
 * findAllDecisions()
 *
 * @param {function()} done
 */
function findAllDecisions(done)
{
    findDecisions(done, 0, '1790-02', '2017-10');
}

/**
 * findLonerJustices()
 *
 * NOTE: You must now specify the "--build" option to generate site files.
 *
 * @param {function()} done
 */
function findLonerJustices(done)
{
    /*
     * If we've already built lonerJustices.json, then use it; otherwiser, build it.
     */
    let lonerJustices = JSON.parse(readTextFile(rootDir + _data.lonerJustices) || "[]");
    if (!lonerJustices.length) {
        let lonerBuckets = {};
        let vars = JSON.parse(readTextFile(rootDir + sources.scdb.vars));
        let justices = JSON.parse(readTextFile(rootDir + sources.results.justices));
        justices.forEach((justice) => {
            if (justice.scdbJustice) {
                let id = vars.justice.values[justice.scdbJustice];
                if (id == "CEHughes2") id = "CEHughes1";
                if (id) {
                    justice.scdbJustice = id;
                    if (!lonerBuckets[justice.scdbJustice]) {
                        lonerBuckets[justice.scdbJustice] = [];
                    } else {
                        printf("warning: SCDB justice ID %s listed multiple times\n", id);
                    }
                } else {
                    printf("warning: SCDB justice index %d has no SCDB justice ID\n", justice.scdbJustice);
                }
            } else {
                printf("warning: justice %s has no SCDB justice index\n", justice.id);
            }
        });
        let lonerDecisions = JSON.parse(readTextFile(rootDir + _data.lonerDecisions));
        lonerDecisions.forEach((decision) => {
            let dissenterId = decision.dissenterId;
            if (dissenterId == "CEHughes2") dissenterId = "CEHughes1";
            if (dissenterId) {
                if (lonerBuckets[dissenterId]) {
                    lonerBuckets[dissenterId].push(decision);
                } else {
                    printf("warning: unable to find justice ID %s\n", dissenterId);
                }
            }
        });
        let dissenterIds = Object.keys(lonerBuckets);
        dissenterIds.forEach((id) => {
            lonerJustices.push({
                id: getJusticeId(id),
                name: vars.justiceName.values[id],
                loneTotal: lonerBuckets[id].length,
                loneDissents: lonerBuckets[id],
            });
        });
        lonerJustices.sort(function(a,b) {
            return (a.loneTotal < b.loneTotal)? 1 : ((a.loneTotal > b.loneTotal)? -1 : 0);
        });
        writeTextFile(rootDir + _data.lonerJustices, lonerJustices, argv['overwrite']);
    }
    let lonerIndex = "";
    lonerJustices.forEach((justice) => {
        printf("%s: %d dissent%s\n", justice.name, justice.loneTotal, justice.loneTotal == 1? '' : 's');
        if (argv['build']) {
            /*
            * Create a page for each Justice's lone dissents.
            */
            let pageName = sprintf("Justice %s's Lone Dissents", justice.name);
            let pathName = "/justices/loners/" + justice.id;
            let fileName = "/_pages" + pathName + ".md";
            let text = '---\ntitle: "' + pageName + '"\npermalink: ' + pathName + '\nlayout: cases\n';
            text += 'cases:\n';
            justice.loneDissents.forEach((dissent) => {
                let volume = 0, page = 0;
                let matchCite = dissent.usCite.match(/^([0-9]+)\s*U\.?\s*S\.?\s*([0-9]+)$/);
                if (matchCite) {
                    volume = +matchCite[1];  page = +matchCite[2];
                }
                text += '  - id: "' + dissent.caseId + '"\n';
                text += '    termId: "' + dissent.termId + '"\n';
                text += '    title: "' + dissent.caseName + '"\n';
                if (volume) text += sprintf('    volume: "%03d"\n', volume);
                if (page) text += sprintf('    page: "%03d"\n' , page);
                if (dissent.pdfSource) text += '    pdfSource: "' + dissent.pdfSource + '"\n';
                if (dissent.pdfPage) text += '    pdfPage: ' + dissent.pdfPage + '\n';
                if (dissent.pdfPageDissent) text += '    pdfPageDissent: ' + dissent.pdfPageDissent + '\n';
                text += '    dateDecision: "' + sprintf("%#C", dissent.dateDecision) + '"\n';
                text += '    citation: "' + (dissent.usCite || ('No. ' + dissent.docket)) + '"\n';
                text += '    dissenterId: "' + justice.id + '"\n';
                text += '    dissenterName: "' + justice.name + '"\n';
            });
            text += '---\n';
            writeTextFile(rootDir + fileName, text, argv['overwrite'], true);
            lonerIndex += sprintf("- [%s](/justices/loners/%s) (%d dissent%s)\n", justice.name, justice.id, justice.loneTotal, justice.loneTotal == 1? '' : 's');
        }
    });
    /*
     * And finally, build an index of all Justices with dissents.
     */
    if (lonerIndex) {
        let pathName = "/justices/loners";
        let fileName = "/_pages" + pathName + ".md";
        lonerIndex = '---\ntitle: "U.S. Supreme Court Justices with Lone Dissents"\npermalink: ' + pathName + '\nlayout: archive\n---\n\n' + lonerIndex;
        writeTextFile(rootDir + fileName, lonerIndex, argv['overwrite']);
    }
    done();
}

/**
 * findLonerMatches()
 *
 * @param {function()} done
 */
function findLonerMatches(done)
{
    let dateBuckets = {};
    let lonerJustices = JSON.parse(readTextFile(rootDir + _data.lonerJustices) || "[]");
    lonerJustices.forEach((justice) => {
        justice.loneDissents.forEach((dissent) => {
            if (!dateBuckets[dissent.dateDecision]) {
                dateBuckets[dissent.dateDecision] = [];
            }
            dateBuckets[dissent.dateDecision].push(dissent);
        });
    });

    let pageName = sprintf("Loner Parties");
    let pathName = "/trivia/parties";
    let fileName = "/_pages" + pathName + ".md";
    let text = '---\ntitle: "' + pageName + '"\npermalink: ' + pathName + '\nlayout: archive\n---\n';

    let dates = Object.keys(dateBuckets);
    dates.sort();
    dates.forEach((date) => {
        let bucket = dateBuckets[date];
        if (bucket.length > 1) {
            printf("date %s had %d lone dissents\n", date, bucket.length);
            text += sprintf("\n## %#C\n\n", date);
            bucket.forEach((dissent) => {
                text += '- [' + dissent.caseName + '](/cases/loners/' + dissent.termId + '#' + dissent.caseId + '): Dissent by [' + dissent.dissenterName + '](/justices/loners/' + getJusticeId(dissent.dissenterId) + '#' + dissent.caseId + ')\n';
            });
        }

    });
    writeTextFile(rootDir + fileName, text, argv['overwrite']);
    done();
}

function testDates(done)
{
    let date, format;

    date = new Date("2018-08-10");              // date-only strings are considered UTC
    printf("\nnew Date(\"2018-08-10\"): UTC\n");
    format = "%s\t%#C\n\t%#T (UTC)\n";
    printf(format, format, date, date);
    format = "%s\t%W, %.3F %D, %Y - %I:%02N:%02S%A\n";
    printf(format, format, date, date, date, date, date, date, date, date);
    format = "%s\t%#W, %#M/%#D/%#0.2Y - %#I:%#02N:%#02S%#A\n";
    printf(format, format, date, date, date, date, date, date, date, date);

    date = datelib.adjustDate(date, -365);      // adjustDate() works regardless of UTC vs. LOCAL
    printf("\ndate = adjustDate(date, -365)\n");
    format = "%s\t%W, %.3F %D, %Y - %I:%02N:%02S%A\n";
    printf(format, format, date, date, date, date, date, date, date, date);
    format = "%s\t%#W, %#M/%#D/%#0.2Y - %#I:%#02N:%#02S%#A\n";
    printf(format, format, date, date, date, date, date, date, date, date);

    date = new Date(date.getTime());            // getTime() returns UTC, and Date() creates UTC
    printf("\ndate = new Date(date.getTime()): UTC\n");
    format = "%s\t%W, %.3F %D, %Y - %I:%02N:%02S%A\n";
    printf(format, format, date, date, date, date, date, date, date, date);
    format = "%s\t%#W, %#M/%#D/%#0.2Y - %#I:%#02N:%#02S%#A\n";
    printf(format, format, date, date, date, date, date, date, date, date);

    date = new Date(2018, 7, 10);               // dates with multiple arguments are LOCAL (*not* UTC)
    printf("\nnew Date(2018, 7, 10): LOCAL\n");
    format = "%s\t%W, %.3F %D, %Y - %I:%02N:%02S%A\n";
    printf(format, format, date, date, date, date, date, date, date, date);
    format = "%s\t%#W, %#M/%#D/%#0.2Y - %#I:%#02N:%#02S%#A\n";
    printf(format, format, date, date, date, date, date, date, date, date);

    date = new Date(2018, 7, 10, 18, 5, 30);    // dates with multiple arguments are LOCAL (*not* UTC)
    printf("\nnew Date(2018, 7, 10, 18, 5, 30): LOCAL\n");
    format = "%s\t%W, %.3F %D, %Y - %I:%02N:%02S%A\n";
    printf(format, format, date, date, date, date, date, date, date, date);
    format = "%s\t%#W, %#M/%#D/%#0.2Y - %#I:%#02N:%#02S%#A\n";
    printf(format, format, date, date, date, date, date, date, date, date);

    let terms = ['1790-02', '1953-06', '1980-12-12'];
    terms.forEach((term) => {
        printf("getTermName(%s): %s\n", term, getTermName(term))
    });

    done();
}

gulp.task("courts", buildCourts);
gulp.task("decisions", buildDecisions);
gulp.task("justices", buildJustices);
gulp.task("allDecisions", findAllDecisions);
gulp.task("lonerDecisions", findLonerDecisions);
gulp.task("lonerJustices", findLonerJustices);
gulp.task("loners", gulp.series(findLonerDecisions, findLonerJustices));
gulp.task("matches", findLonerMatches);
gulp.task("backup", backupLonerDecisions);
gulp.task("tests", testDates);
gulp.task("default", findDecisions);
