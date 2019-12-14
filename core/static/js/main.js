var lookup = {
    "Conservative": "rgb(5, 117, 201)",
    "Labour": "rgb(223, 29, 14)",
    "Liberal Democrat": "rgb(239, 172, 24)",
    "Scottish National Party": "rgb(248, 237, 46)",
    "Green": "rgb(95, 178, 95)",
    "The Brexit Party": "#02b6d7",
    "Democratic Unionist Party": "#b51c4b",
    "Sinn F\u00e9in": "#159b78",
    "Other": "gray"
}

function getWinner(parties) {
    return Object.keys(parties).reduce(
        function(a, b){ return parties[a] > parties[b] ? a : b }
    )
}

function summariseData(data) {
    var parties = {
        "Labour": 0, "Conservative": 0, "Liberal Democrat": 0,
        "Scottish National Party": 0, "The Brexit Party": 0, "Green": 0,
        "Democratic Unionist Party": 0, "Sinn F\u00e9in": 0, "Other": 0
    }
    var summary = {
        "seats": {...parties}, "votes": {...parties}
    }
    for (var conId in data) {
        for (var party in data[conId].parties) {
            if (party in summary.votes) {
                summary.votes[party] += data[conId].parties[party];
            } else {
                summary.votes.Other += data[conId].parties[party];
            }
        }
        var winner = getWinner(data[conId].parties);
        if (winner in summary.seats) {
            summary.seats[winner] += 1;
        } else {
            summary.seats.Other += 1;
        }
    }
    return summary;
}

function applyRules() {
    var ruleElements = document.getElementsByClassName("rule");
    var rules = [];
    for (var rule of ruleElements) {
        var pc = parseInt(rule.getElementsByTagName("input")[0].value) / 100;
        var party1 = rule.getElementsByTagName("select")[0].value;
        var party2 = rule.getElementsByTagName("select")[2].value;
        var region = rule.getElementsByTagName("select")[1].value;
        if (!isNaN(pc) && pc > 0 && pc <= 1 && party1 !== "" && party2 !== "") {
            rules.push([pc, party1, party2, region])
        }
    }
    updateLink(rules);
    if (rules.length) {
        newData = getNewData(data, rules);
        updateBars(newData);
        updateMap(newData);
    } else {
        updateBars(data);
        updateMap(data);
    }
    
}

function updateLink(rules) {
    parties = {
        "Conservative": "con", "Labour": "lab", "Liberal Democrat": "ld",
        "Green": "green", "Scottish National Party": "snp",
        "The Brexit Party": "bp", "Democratic Unionist Party": "dup",
        "Sinn Féin": "sf"
    }
    regions = {
        "England": "eng", "Scotland": "sco", "Wales": "wal", "Northern Ireland": "ni"
    }
    var link = document.getElementsByClassName("link").item(0).getElementsByTagName("a").item(0);
    var args = [];
    for (var rule of rules) {
        var arg = `${parties[rule[1]]}-${parties[rule[2]]}=${Math.round(rule[0] * 100)}`;
        if (rule[3] !== "The whole UK") {
            arg = arg.replace("=", `-${regions[rule[3]]}=`)
        }
        args.push(arg);
    }
    if (args.length) {
        args = args.join("&");
        var root = link.dataset.root;
        link.innerHTML = `${root}/?${args}`;
        link.href = `${root}/?${args}`;
        link.parentNode.style.display = "block";
    } else {
        link.parentNode.style.display = null;
    }
    
}

function getNewData(data, rules) {
    var newData = JSON.parse(JSON.stringify(data));

    for (conId in newData) {

        var parties = newData[conId].parties;
        var oldParties = {...parties}

        for (var rule of rules) {
            if (rule[1] in parties && rule[2] in parties && (rule[3] === "The whole UK" || rule[3][0] === conId[0])) {
                voters = parseInt(oldParties[rule[1]] * rule[0]);
                if (voters > parties[rule[1]]) {
                    voters = parties[rule[1]];
                }
                parties[rule[1]] -= voters;
                parties[rule[2]] += voters;
            }
        }
    }
    return newData;
}

function updateBars(data) {
    var seatsTable = document.getElementById("seatsTable");
    var votesTable = document.getElementById("votesTable");
    var summary = summariseData(data);
    const allVotes = Object.values(summary.votes).reduce((a,b) => a + b, 0);
    for (var table of [seatsTable, votesTable]) {
        for (var row of table.rows) {
            var party = row.cells[0].innerText;
            var bar = row.cells[1].getElementsByClassName("bar").item(0);
            bar.style.backgroundColor = lookup[party];
            if (table.id === "seatsTable") {
                row.getElementsByTagName("span").item(0).innerText = summary.seats[party];
                width = (summary.seats[party] / 6.5).toString().slice(0, 4) + "%";
            } else {
                row.getElementsByTagName("span").item(0).innerText = summary.votes[party];
                width = (summary.votes[party] / allVotes * 100).toString().slice(0, 4) + "%";
            }
            
            bar.style.width = width;
        }
    }
}

function updateMap(data) {
    for (conId in data) {

        var parties = data[conId].parties;
        var winner = getWinner(parties);
        document.getElementById(conId).style.fill = lookup[winner];
        document.getElementById(conId).style.stroke = "rgb(100, 100, 100)";
        
    } 
}

function addRule() {
    var rule = document.getElementsByClassName("rule").item(0);
    var rules = document.getElementsByClassName("rules").item(0);
    for (var rule of rules.getElementsByClassName("rule")) {
        rule.getElementsByTagName("img").item(0).style.display = "inline";
    }
    var newRule = rule.cloneNode(true);
    for (var option of newRule.getElementsByTagName("option")) {
        option.selected = false;
    }
    newRule.getElementsByTagName("input")[0].value = "";
    rules.appendChild(newRule);
}

function removeRule(event) {
    event.target.parentNode.remove();
    var rules = document.getElementsByClassName("rule");
    if (rules.length === 1) {
        for (var rule of rules) {
            rule.getElementsByTagName("img").item(0).style.display = null;
        }
    }
    applyRules();
}