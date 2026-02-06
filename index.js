const units = {
    length: {
        meter: 1, //base
        kilometer: 1000,
        centimeter: 0.01,
        millimeter: 0.001,
        mile: 1609.34,
        yard: 0.9144,
        foot: 0.3048,
        inch: 0.0254
    },
    weight: {
        gram: 1, //base
        kilogram: 1000,
        milligram: 0.001,
        pound: 453.592,
        ounce: 28.3495,
        ton: 1000000
    },

    //each has different formula, will be held in functions later
    temperature: {
        celsius: "Celsius",
        fahrenheit: "Fahrenheit",
        kelvin: "Kelvin"
    }
};

//html elements
const tabs = document.querySelectorAll('.tab-btn');
const amountInput = document.getElementById('amountInput');
const fromSelect = document.getElementById('fromUnit');
const toSelect = document.getElementById('toUnit');
const convertBtn = document.getElementById('convert-btn');
const resultSection = document.querySelector('.result-section');
const mainResultText = document.getElementById('result');
const exchangeIcon = document.querySelector('.exchange-icon');

let currentCategory = 'length';

window.addEventListener('DOMContentLoaded', function() {
    populateDropdowns();
});


tabs.forEach(   
function(tab) {
    tab.addEventListener("click", function(e){
        const activeBtn = document.querySelector(".tab-btn.active");
        activeBtn.classList.remove("active");
        e.target.classList.add("active");
        currentCategory = e.target.dataset.category;

        populateDropdowns(); //refresh dropdowns


        //clear calculations
        mainResultText.innerText = "Enter Value...";
        clearOtherResults();
        amountInput.value = "";

    });
});

function populateDropdowns(){
    fromSelect.innerHTML = "";
    toSelect.innerHTML = "";

    const keys = Object.keys(units[currentCategory]);


    keys.forEach(function(key) {
        let displayName = formatName(key);
        
        let option1 = new Option(displayName, key); 
        let option2 = new Option(displayName, key);

        fromSelect.add(option1); //same for each select (from,to)
        toSelect.add(option2);
    });

    //default: from = select first one --- to = selects second one
    if (keys.length > 1) {
        toSelect.selectedIndex = 1;
    }
}

convertBtn.addEventListener("click", function(){
    const amountVal = amountInput.value;
    
    if(amountVal === "") {
        mainResultText.innerText = "Enter Value...";
        clearOtherResults();
        return;
    }

    const amount = parseFloat(amountVal);
    const from = fromSelect.value;
    const to = toSelect.value;
    
    if( isNaN(amount) ) { //check is Not a Number
        mainResultText.innerText = "Please enter a valid number!"
        clearOtherResults();
        return;
    }

    const result = calculate(amount, from, to);
    mainResultText.innerText = amount + " " + formatName(from) + " = " + formatNumber(result) + " " + formatName(to); 

    listOtherResults(amount, from, to);
})

exchangeIcon.addEventListener('click', function() {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    
    // if there is a value press convert button directly
    if(amountInput.value !== "") {
        convertBtn.click();
    }
});

function calculate( value, from, to){
    if (from === to) {
        return value;
    }
    if (currentCategory === "temperature") {
        //first transfer value to Celsius
        if( from === "celsius") {
            c = value;
        } else if ( from === "fahrenheit"){
            c = (value - 32) * 5/9;
        } else {
            c = value - 273.15;
        }
        
        //then calculate target value
        if ( to === "celsius" ) {
            return c;
        } else if ( to === "fahrenheit") {
            return ( (c*9/5) + 32 );
        } else {
            return c + 273.15;
        }
    } else {
        const base = value * units[currentCategory][from];
        return base / units[currentCategory][to];
        
    }

}

function listOtherResults(index, from, currentTo) {
    clearOtherResults();
    const keys = Object.keys(units[currentCategory])


    keys.forEach(function(target){
        if (target === currentTo || from === target) {
            return; 
        }
        const res = calculate(index, from, target);


        const p = document.createElement('p');
        p.className = "result-text";
        p.id = "otherResults";
        p.innerText = index + " " + formatName(from) + " = " + formatNumber(res) + " " + formatName(target);
        resultSection.appendChild(p);
    });

}

function clearOtherResults() {
    const others = document.querySelectorAll('#otherResults');
    
    others.forEach(function(el) {
        el.remove();
    });
}


// format number remove unnecessary 0's
function formatNumber(num) {
    return Number(num.toFixed(5)).toString();
}
//format function for strings
function formatName(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}