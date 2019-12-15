var lookup = {
    "Conservative": "#0575c9",
    "Labour": "#df1d0e",
    "Liberal Democrat": "#efac18",
    "Scottish National Party": "#f8ed2e",
    "Green": "#5fb25f",
    "The Brexit Party": "#02b6d7",
    "Plaid Cymru": "#13e594",
    "Democratic Unionist Party": "#b51c4b",
    "Sinn F\u00e9in": "#159b78",
    "Other": "#999999"
}

function getWinner(parties) {
    return Object.keys(parties).reduce(
        function(a, b){ return parties[a] > parties[b] ? a : b }
    )
}


function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function summariseData(dataObj) {
    var parties = {
        "Labour": 0, "Conservative": 0, "Liberal Democrat": 0,
        "Scottish National Party": 0, "The Brexit Party": 0, "Green": 0,
        "Democratic Unionist Party": 0, "Sinn F\u00e9in": 0,
        "Plaid Cymru": 0, "Other": 0
    }
    var summary = {
        "seats": {...parties}, "votes": {...parties}, "result": "ss"
    }
    for (var conId in dataObj) {
        for (var party in data[conId].parties) {
            if (party in summary.votes) {
                summary.votes[party] += dataObj[conId].parties[party];
            } else {
                summary.votes.Other += dataObj[conId].parties[party];
            }
        }
        var winner = getWinner(dataObj[conId].parties);
        if (winner in summary.seats) {
            summary.seats[winner] += 1;
        } else {
            summary.seats.Other += 1;
        }
    }
    var winner = getWinner(summary.seats);
    if (summary.seats[winner] > 325) {
        var majority = (summary.seats[winner] - 325) * 2;
        summary.result = `${winner} majority of ${majority}`
    } else {
        summary.result = `Hung Parliament (${winner} largest party)`
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
        "Sinn Féin": "sf", "Plaid Cymru": "pc"
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
    newData = JSON.parse(JSON.stringify(data));

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

function updateBars(newData) {
    var seatsTable = document.getElementById("seatsTable");
    var votesTable = document.getElementById("votesTable");
    var oldSummary = summariseData(data);
    var summary = summariseData(newData);
    const allVotes = Object.values(summary.votes).reduce((a,b) => a + b, 0);
    for (var table of [seatsTable, votesTable]) {
        for (var row of table.rows) {
            var party = row.cells[0].innerText;
            var bar = row.cells[1].getElementsByClassName("bar").item(0);
            bar.style.backgroundColor = lookup[party];
            var info = table.id === "seatsTable" ? summary.seats: summary.votes;
            var oldInfo = table.id === "seatsTable" ? oldSummary.seats: oldSummary.votes;
            
            var diff = info[party] - oldInfo[party];
            var text = info[party].toString();
            
            if (table.id === "seatsTable") {
                text += diff ? ` (${diff > 0 ? "+" : ""}${diff})` : "";
                width = (0.8 * summary.seats[party] / 6.5).toString().slice(0, 4) + "%";
            } else {
               
                width = (0.8 * summary.votes[party] / allVotes * 100).toString().slice(0, 4) + "%";
            }
            row.getElementsByTagName("span").item(0).innerText = formatNumber(text);
            
            bar.style.width = width;
        }
    }
    document.getElementsByClassName("summary").item(0).innerText = summary.result;
    document.getElementsByClassName("interface").item(0).style.backgroundColor = lookup[getWinner(summary.seats)] + "08";
}

function updateMap(dataObj) {
    var selector = document.getElementsByClassName("party-selector").item(0);
    var party = selector.getElementsByTagName("span").item(0).innerText;
    for (conId in dataObj) {
        if (party === "All Parties") {
            var parties = dataObj[conId].parties;
            var winner = getWinner(parties);
            document.getElementById(conId).style.fill = lookup[winner]; 
        } else {
            var proportion = party in dataObj[conId].parties ? dataObj[conId].parties[party] / (Object.values(dataObj[conId].parties).reduce((a, b) => a + b) * 0.6): 0;
            var hex = (Math.round(proportion * 256)).toString(16);
            hex = hex.length === 1 ? "0" + hex : hex;
            hex = hex.length === 3 ? "ff" : hex;
            document.getElementById(conId).style.fill = lookup[party] + hex;
        }
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
    event.target.parentNode.parentNode.remove();
    var rules = document.getElementsByClassName("rule");
    if (rules.length === 1) {
        for (var rule of rules) {
            rule.getElementsByTagName("img").item(0).style.display = null;
        }
    }
    applyRules();
}


function changeParty(delta) {
    var parties = [
        "All Parties", "Conservative", "Labour", "Liberal Democrat",
        "Scottish National Party", "Green", "The Brexit Party",
        "Democratic Unionist Party", "Sinn Féin", "Plaid Cymru"
    ]
    var selector = document.getElementsByClassName("party-selector").item(0);
    var text = selector.getElementsByTagName("span").item(0);
    var index = parties.indexOf(text.innerText);
    var nextIndex = index + delta;
    if (nextIndex >= parties.length) {
        nextIndex = 0;
    }
    if (nextIndex < 0) {
        nextIndex = parties.length - 1;
    }
    text.innerText = parties[nextIndex];
    updateMap(newData);
}

var svg = document.getElementsByTagName("svg").item(0);
svg.addEventListener("mouseover", (event) => {
    var panel = document.getElementsByClassName("panel").item(0);
    if (event.target.tagName.toLowerCase() === "path" && event.target.id.length) {
        
        
        var info = newData[event.target.id];
        panel.getElementsByClassName("constituency").item(0).innerText = info["name"];
        var results = panel.getElementsByClassName("results").item(0);
        results.innerHTML = "";
        var sortedParties = Object.keys(info.parties).sort(function(a,b){return info.parties[b]-info.parties[a]});
        var majority = info.parties[sortedParties[0]] - info.parties[sortedParties[1]];
        panel.getElementsByClassName("majority").item(0).innerText = `${sortedParties[0]} majority: ${formatNumber(majority)}`;
        for (var party of sortedParties ) {
            var diff = info.parties[party] - data[event.target.id].parties[party];
            diff = diff ? `(${diff > 0 ? "+" : ""}${formatNumber(diff)})` : "";
            results.innerHTML += `<div><span style="border-bottom: 1.5px solid ${lookup[party] || lookup["Other"]}C0">${party}</span>: ${formatNumber(info.parties[party])} ${diff}</div>`
        }
        panel.style.display = "block";
        var D = document;
        h = Math.max(
            D.body.scrollHeight, D.documentElement.scrollHeight,
            D.body.offsetHeight, D.documentElement.offsetHeight,
            D.body.clientHeight, D.documentElement.clientHeight
        );
        w = Math.max(
            D.body.scrollWidth, D.documentElement.scrollWidth,
            D.body.offsetWidth, D.documentElement.offsetWidth,
            D.body.clientWidth, D.documentElement.clientWidth
        );
        if (h - event.pageY <= panel.clientHeight) {
            panel.style.top = (event.pageY - panel.clientHeight) + "px";
        } else {
            panel.style.top = event.pageY + "px";
        }
        if (w - event.pageX <= panel.clientWidth) {
            panel.style.left = (event.pageX - panel.clientWidth) + "px";
        } else {
            panel.style.left = event.pageX + "px";
        }
    } else {
        panel.style.display = null;
    }
})