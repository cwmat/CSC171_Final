/**
 * Created by Max DeCurtins on 4/14/2016.
 */

var formatYear = d3.time.format('%Y');

var formatDate = d3.time.format('%Y-%m-%d');

/**
 * Function is from
 * http://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
 * JS arrays should really have union/intersection/difference built-in...
 *
 *
 * @param a An array
 * @param b An array
 * @returns {Array} The intersection of a and b.
 */
function intersection(a, b) {

    var i = 0, j = 0, result = [];

    while (i < a.length && j < b.length) {

        if(a[i] < b[j]) i++;
        else if(a[i] > b[j]) j++;
        else {
            result.push(a[i]);
            i++;
            j++;
        }
    }
    return result;
}

/**
 * Use this function to get a full state name from an abbreviation, or
 * vice versa.
 *
 * @param state A state abbreviation or a state name.
 * @return {String} Either a state name or its abbreviation.
 */
function mapState(state) {
    var valueToReturn;
    state = state.toUpperCase();

    var states = {
        AK: 'Alaska',
        AL: 'Alabama',
        AR: 'Arkansas',
        AZ: 'Arizona',
        CA: 'California',
        CO: 'Colorado',
        CT: 'Connecticut',
        DC: 'District of Columbia',
        DE: 'Delaware',
        FL: 'Florida',
        GA: 'Georgia',
        HI: 'Hawaii',
        IA: 'Iowa',
        ID: 'Idaho',
        IL: 'Illinois',
        IN: 'Indiana',
        KS: 'Kansas',
        KY: 'Kentucky',
        LA: 'Louisiana',
        MA: 'Massachusetts',
        MD: 'Maryland',
        ME: 'Maine',
        MI: 'Michigan',
        MN: 'Minnesota',
        MO: 'Missouri',
        MS: 'Mississippi',
        MT: 'Montana',
        NC: 'North Carolina',
        ND: 'North Dakota',
        NE: 'Nebraska',
        NH: 'New Hampshire',
        NJ: 'New Jersey',
        NM: 'New Mexico',
        NV: 'Nevada',
        NY: 'New York',
        OH: 'Ohio',
        OK: 'Oklahoma',
        OR: 'Orgeon',
        PA: 'Pennsylvania',
        PR: 'Puerto Rico',
        RI: 'Rhode Island',
        SC: 'South Carolina',
        SD: 'South Dakota',
        TN: 'Tennessee',
        TX: 'Texas',
        UT: 'Utah',
        VA: 'Virginia',
        VT: 'Vermont',
        WA: 'Washington',
        WI: 'Wisconsin',
        WV: 'West Virginia',
        WY: 'Wyoming'
    };

    // Given an abbreviation, return a full state name.
    if(state.length == 2) {
        if(states.hasOwnProperty(state)) {
            valueToReturn = states[state];
        }
    } else {
        // Given a full state name, return an abbreviation.
        for(var key in states) {
            var fullNameLC = states[key].toLowerCase();
            if(state.toLowerCase() == fullNameLC) {
                valueToReturn = key;
            }
        }
    }

    return valueToReturn;
}

