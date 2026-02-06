const translations = {
    en: {
        title: "Unit Conversion",
        subtitle: "Enter Value:",
        convertBtn: "Convert",
        from: "From:",
        to: "To:",
        placeholder: "Enter a value...",
        error: "Please enter a valid number!",
        tabLength: "Length",
        tabWeight: "Weight",
        tabTemp: "Temperature",
        units: {
            meter: "Meter", kilometer: "Kilometer", centimeter: "Centimeter", millimeter: "Millimeter", mile: "Mile", yard: "Yard", foot: "Foot", inch: "Inch",
            gram: "Gram", kilogram: "Kilogram", milligram: "Milligram", pound: "Pound", ounce: "Ounce", ton: "Ton", carrat: "Carrat",
            celsius: "Celsius", fahrenheit: "Fahrenheit", kelvin: "Kelvin"
        }
    },
    tr: {
        title: "Birim Çevirici",
        subtitle: "Değer Giriniz:",
        convertBtn: "Çevir",
        from: "Şundan:",
        to: "Şuna:",
        placeholder: "Değer giriniz...",
        error: "Lütfen geçerli bir sayı girin!",
        tabLength: "Uzunluk",
        tabWeight: "Ağırlık",
        tabTemp: "Sıcaklık",
        units: {
            meter: "Metre", kilometer: "Kilometre", centimeter: "Santimetre", millimeter: "Milimetre", mile: "Mil", yard: "Yarda", foot: "Fit", inch: "İnç",
            gram: "Gram", kilogram: "Kilogram", milligram: "Miligram", pound: "Libre", ounce: "Ons", ton: "Ton", carrat: "Karat",
            celsius: "Selsiyus", fahrenheit: "Fahrenhayt", kelvin: "Kelvin"
        }
    }
};



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
        ton: 1000000,
        carrat: 0.2
    },

    //each has different formula, will be held in functions later
    temperature: {
        celsius: "Celsius",
        fahrenheit: "Fahrenheit",
        kelvin: "Kelvin"
    }
};

//html elements
const tabs = document.querySelectorAll(".tab-btn");
const amountInput = document.getElementById("amountInput");
const fromSelect = document.getElementById("fromUnit");
const toSelect = document.getElementById("toUnit");
const convertBtn = document.getElementById("convert-btn");
const resultSection = document.querySelector(".result-section");
const mainResultText = document.getElementById("result");
const exchangeIcon = document.querySelector(".exchange-icon");

const btnEN = document.getElementById("btn-en");
const btnTR = document.getElementById("btn-tr");

let currentCategory = "length";
let currentLang = "";

window.addEventListener("DOMContentLoaded", function() { //start
    updateLanguage("tr");
});
 
//update language
btnEN.addEventListener("click", function() { updateLanguage("en"); });
btnTR.addEventListener("click", function() { updateLanguage("tr"); }); 

function updateLanguage(lang) {
    if (currentLang === lang) { return; }
    currentLang = lang;

    // Buton style
    if (lang === "en") {
        btnEN.classList.add("active-lang");
        btnTR.classList.remove("active-lang");
    } else {
        btnTR.classList.add("active-lang");
        btnEN.classList.remove("active-lang");
    }

    // translate
    document.getElementById("ui-title").innerText = translations[lang].title;
    document.getElementById("ui-subtitle").innerText = translations[lang].subtitle;
    document.getElementById("convert-btn").innerText = translations[lang].convertBtn;
    document.getElementById("ui-from").innerText = translations[lang].from;
    document.getElementById("ui-to").innerText = translations[lang].to;
    document.getElementById("tab-length").innerText = translations[lang].tabLength;
    document.getElementById("tab-weight").innerText = translations[lang].tabWeight;
    document.getElementById("tab-temp").innerText = translations[lang].tabTemp;

    // Kutuları Sıfırla
    mainResultText.innerText = translations[lang].placeholder;
    clearOtherResults();
    populateDropdowns();
}


tabs.forEach(   
function(tab) {
    tab.addEventListener("click", function(e){
        const activeBtn = document.querySelector(".tab-btn.active");
        activeBtn.classList.remove("active");
        e.target.classList.add("active");
        currentCategory = e.target.dataset.category;

        populateDropdowns(); //refresh dropdowns


        //clear calculations
        mainResultText.innerText = translations[currentLang].placeholder;
        clearOtherResults();
        amountInput.value = "";

    });
});

function populateDropdowns(){
    const oldFrom = fromSelect.value;
    const oldTo = toSelect.value;

    fromSelect.innerHTML = "";
    toSelect.innerHTML = "";

    const keys = Object.keys(units[currentCategory]);


    keys.forEach(function(key) {
        let displayName = translations[currentLang].units[key];
        
        let option1 = new Option(displayName, key); 
        let option2 = new Option(displayName, key);

        fromSelect.add(option1); //same for each select (from,to)
        toSelect.add(option2);
    });

   
    if (oldFrom && oldTo && keys.includes(oldFrom)) { //if the previous ones are still there select those
        fromSelect.value = oldFrom;
        toSelect.value = oldTo;
    } else if (keys.length > 1) { //default: from = select first one --- to = selects second one
        toSelect.selectedIndex = 1;
    }
}

convertBtn.addEventListener("click", function(){
    const amountVal = amountInput.value;
    
    if(amountVal === "") {
        mainResultText.innerText = translations[currentLang].placeholder;
        clearOtherResults();
        return;
    }

    const amount = parseFloat(amountVal);
    const from = fromSelect.value;
    const to = toSelect.value;
    
    if( isNaN(amount) ) { //check is Not a Number
        mainResultText.innerText = translations[currentLang].error;
        clearOtherResults();
        return;
    }

    const result = calculate(amount, from, to);
    const fromName = translations[currentLang].units[from];
    const toName = translations[currentLang].units[to];

    mainResultText.innerText = amount + " " +  fromName + " = " + formatNumber(result) + " " + toName; 

    listOtherResults(amount, from, to);
})

exchangeIcon.addEventListener("click", function() {
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
        const fromName = translations[currentLang].units[from];
        const targetName = translations[currentLang].units[target];    

        const p = document.createElement("p");
        p.className = "result-text";
        p.id = "otherResults";
        p.innerText = index + " " + fromName + " = " + formatNumber(res) + " " + targetName;
        resultSection.appendChild(p);
    });

}

function clearOtherResults() {
    const others = document.querySelectorAll("#otherResults");
    
    others.forEach(function(el) {
        el.remove();
    });
}


// format number remove unnecessary 0"s
function formatNumber(num) {
    return Number(num.toFixed(5)).toString();
}