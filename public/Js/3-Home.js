function FetchData() {
    fetch("/MainData.JSON")
        .then((res) => res.json())
        .then((Data) => { DoThis(Data[0], Data[1]) })
        .catch((err) => { return location.href = "/Error" })
} FetchData()

function DoThis(MainData, Decode) {
    let UserWelcome = document.querySelector(".Congratulations .card-title").innerText.replace("👋♥", " ");
    if (MainData.VoiceMessage === true) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(UserWelcome))
    }
    DeleteNotification(MainData)
    DollarPrice(Decode)
    BarCercel()
    charts(MainData)
}

function BarCercel() {
    let cecrel = document.querySelector(".cecrel");
    let value = document.querySelector(".value");
    let start = 0;
    if (value.id == 0) { return }
    let progress = setInterval(() => {
        start++
        value.textContent = `${start}%`
        cecrel.style.background = `conic-gradient(var(--Primary) ${start * 3.6}deg, var(--bg-bar) 0deg)`
        if (start == value.id) {
            clearInterval(progress)
        }
    }, 120);
}

function DeleteNotification(MainData) {
    MainData.NotificationsData.forEach(Notification => {
        let id = Notification._id
        interval = Math.floor((new Date() - new Date(Notification.CreatedAt)) / 86400000);
        if (interval > 14) {
            fetch("/DeleteNotification" + id, { method: "DELETE" })
                .then((res) => res.json())
                .then((Data) => { console.log(Data) })
                .catch((err) => { return location.href = "/Error" })
        }
    })
}

// ******************************************************************************

function charts(MainData) {
    //==================== Get Data =======================
    let ThisMonth = new Date().toJSON().slice(0, 7)
    let Salse = 0, Purchases = 0, Expenses = 0, Revenues = 0;
    let BackSalse = 0, BackPurchases = 0;

    MainData.GeneralData.forEach(Receipt => {
        if (Receipt.DocDate.slice(0, 7) === ThisMonth) {
            if (Receipt.DocType === "تأجير") { Salse += Receipt.Total }
            if (Receipt.DocType === "مرتجع تأجير") { BackSalse += Receipt.Total }
            if (Receipt.DocType === "استئجأر") { Purchases += Receipt.Total }
            if (Receipt.DocType === "مرتجع استئجأر") { BackPurchases += Receipt.Total }
            if (Receipt.Credit === "الايرادات") { Revenues += Receipt.Total }
            if (Receipt.Debit === "المصاريف") { Expenses += Receipt.Total }
        }
    })

    let color = ["#246dec", "#cc3c43", "#367952", "#f5b74f", "#4f35a1", "#035e7b"];
    //====================الشكل الاول =======================
    const chart1 = {
        series: [{ name: " ", data: [Expenses, Revenues, BackPurchases, Purchases, BackSalse, Salse] },],
        chart: { type: 'radar', height: 350, toolbar: { show: false }, },
        colors: color,
        dataLabels: { enabled: false, },
        stroke: { curve: 'smooth' },
        labels: ["المصروفات", "الايرادات", "مرتجع استئجأر", "الاستئجأر", "مرتجع تأجير", "التأجير"],
    };
    const barchart1 = new ApexCharts(document.querySelector("#chart1"), chart1); barchart1.render();

    //====================الشكل الثاني =======================
    const chart2 = {
        series: [{ name: " ", data: [Expenses, Revenues, BackPurchases, Purchases, BackSalse, Salse] }],
        chart: { type: 'bar', height: 350, toolbar: { show: false }, },
        colors: color,
        plotOptions: { bar: { distributed: true, borderRadius: 4, horizontal: false, columnWidth: '25%', } },
        dataLabels: { enabled: false },
        legend: { show: false },
        xaxis: { categories: ["المصروفات", "الايرادات", "مرتجع استئجأر", "الاستئجأر", "مرتجع تأجير", "التأجير"], },
        yaxis: { title: { text: "" } }
    };
    const barChart2 = new ApexCharts(document.querySelector("#chart2"), chart2); barChart2.render();

    //====================الشكل الثالث =======================
}

function DollarPrice(Decode) {
    fetch(`https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${Decode.DollarKey}`)
        .then((req) => req.json())
        .then((Data) => {
            document.querySelector(".PriceOfDollar").innerText = (document.querySelector(".PriceOfDollar").id / parseFloat(Data.rates["KWD"])).toFixed(2) + "$"
            document.querySelector(".ToDayDollar").innerText = "سعر الدولار اليوم " + parseFloat(Data.rates["KWD"]).toFixed(2)
        })
}
