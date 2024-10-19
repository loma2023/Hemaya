let Table = document.querySelector('.Table-body')
let RowFixed = Table.querySelectorAll('tr')[0].innerHTML
let NuReceipt = document.querySelector('.NuReceipt')

if (document.querySelector('.DocDate').value == "") {
  document.querySelector('.DocDate').value = ToDay
}

let Customers = []
fetch("/MainData.JSON")
  .then((res) => res.json())
  .then((MainData) => {
    //  بيانات المنتجات
    // بيانات العملاء او العملاء
    Customers = MainData[0].CustomersData

    // عشان اجيب رقم الفاتورة
    let Number = 1
    MainData[0].GeneralData.forEach(Receipt => { if (!Receipt.DocType.includes("سند")) { Number++ } });
    if (NuReceipt.innerText == "") { NuReceipt.innerText = Number }
  })


// Function NewReceipt
function NewReceipt(event) {
  let Btn = event.target;
  let Status = Btn.getAttribute("Status")
  let ElmDocType = document.querySelector('.DocType')
  let ElmNamePerson = document.querySelector('.NamePerson');
  let ElmTypeAmount = document.querySelector('.TypeAmount')
  let DocType = ElmDocType.value
  let NamePerson = ElmNamePerson.id;
  let TypeAmount = ElmTypeAmount.value
  let SubTotal = parseFloat(document.querySelector('.TotalReceipt').innerText);
  let Total = SubTotal

  let txt = 'يرجي إدخال اسم العميل '

  ElmDocType.classList.remove("Required");
  ElmNamePerson.classList.remove("Required");
  ElmTypeAmount.classList.remove("Required");

  if (Status !== "True") { return Toast(id = 'Notification', txt = "تم حفظ الفاتورة بالفعل",) }

  if (DocType == 'empty') { ElmDocType.classList.add("Required"); return Toast(id = 'Notification', txt = "يرجي تحديد نوع الفاتورة",) }
  if (NamePerson == 'empty') { ElmNamePerson.classList.add("Required"); return Toast(id = 'Notification', txt = txt,) }

  if (Btn.id == "Save") {
    if (Table.querySelectorAll('.NameItem')[0].value == '') {
      return Toast(id = 'Notification', txt = 'يرجي إدخال صنف واحد على الاقل ',);
    }
  }
  if (Btn.id != "Save") {
    if (Table.querySelectorAll('.NameItem')[1].value == '') {
      return Toast(id = 'Notification', txt = 'يرجي إدخال صنف واحد على الاقل ',);
    }
  }
  if (TypeAmount == 'empty') { ElmTypeAmount.classList.add("Required"); return Toast(id = 'Notification', txt = "يرجي تحديد طريقة الدفع",) }

  let Statment = "", Debit = "", Credit = "", SubDebit = "", SubCredit = "";

  // في حالة التأجير النقدي
  if (DocType === "تأجير" && TypeAmount === "نقدي") {
    Statment = "تأجير نقدي", Debit = "الصندوق", Credit = "التأجير", SubDebit = "مقبوضات", SubCredit = "تأجير نقدي";
  }
  // في حالة التأجير الآجل
  if (DocType === "تأجير" && TypeAmount === "آجل") {
    Statment = "تأجير آجل", Debit = "العملاء", Credit = "التأجير", SubDebit = NamePerson, SubCredit = "تأجير آجل";
  }
  // في حالة مرتجع التأجير النقدي
  if (DocType === "مرتجع تأجير" && TypeAmount === "نقدي") {
    Statment = "مرتجع تأجير نقدي", Debit = "التأجير", Credit = "الصندوق", SubDebit = "مرتجع تأجير نقدي", SubCredit = "مدفوعات";
  }
  // في حالة مرتجع التأجير الآجل
  if (DocType === "مرتجع تأجير" && TypeAmount === "آجل") {
    Statment = "مرتجع تأجير آجل", Debit = "التأجير", Credit = "العملاء", SubDebit = "مرتجع تأجير آجل", SubCredit = NamePerson;
  }
  // في حالة الاستئجأر النقدي
  if (DocType === "استئجأر" && TypeAmount === "نقدي") {
    Statment = "استئجأر نقدي", Debit = "الاستئجأر", Credit = "الصندوق", SubDebit = "استئجأر نقدي", SubCredit = "مدفوعات";
  }
  // في حالة الاستئجأر الآجل
  if (DocType === "استئجأر" && TypeAmount === "آجل") {
    Statment = "استئجأر آجل", Debit = "الاستئجأر", Credit = "العملاء", SubDebit = "استئجأر آجل", SubCredit = NamePerson;
  }
  // في حالة مرتجع الاستئجأر النقدي
  if (DocType === "مرتجع استئجأر" && TypeAmount === "نقدي") {
    Statment = "مرتجع استئجأر نقدي", Debit = "الصندوق", Credit = "الاستئجأر", SubDebit = "مقبوضات", SubCredit = "مرتجع استئجأر نقدي";
  }
  // في حالة مرتجع الاستئجأر الآجل
  if (DocType === "مرتجع استئجأر" && TypeAmount === "آجل") {
    Statment = "مرتجع استئجأر آجل", Debit = "العملاء", Credit = "الاستئجأر", SubDebit = NamePerson, SubCredit = "مرتجع استئجأر آجل";
  }

  let ProductArray = []
  let Rows = Table.querySelectorAll('tr')

  Rows.forEach((Row, index) => {
    let NameItem = Row.querySelector('.NameItem').value;
    let obj = {
      NameItem: NameItem,
      QtyItem: Row.querySelector('.QtyItem').value,
      PriceItem: Row.querySelector('.PriceItem').value,
      TotalItem: Row.querySelector('.TotalItem').value,
      StatmentItem: Row.querySelector('.StatmentItem').value,
    }
    if (NameItem != "") {
      if (Btn.id != "Save" && index > 0 || Btn.id == "Save") { ProductArray.push(obj) }
    }
  });

  let Link = '/GeneralData', Method = 'POST', ShowReceipt = "NewReceipt"
  if (Btn.id != "Save") { Link = '/GeneralData' + Btn.id; Method = 'PUT'; ShowReceipt = Btn.id }

  fetch(Link, {
    method: Method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      DocNu: NuReceipt.innerText, DocType: DocType, TypeAmount: TypeAmount, Name: NamePerson,
      DocDate: document.querySelector('.DocDate').value, Statment: Statment, Debit: Debit, Credit: Credit,
      SubDebit: SubDebit, SubCredit: SubCredit, SubTotal: SubTotal, Total: Total, Products: ProductArray,
    })
  })
    .then((res) => res.json())
    .then((Data) => {
      Toast(id = Data.id, txt = Data.txt,);
      if (Data.id === "Success") {
        document.querySelectorAll('.btn-Receipt')[0].setAttribute("Status", "False")
        document.querySelectorAll('.btn-Receipt')[1].setAttribute("Status", "False")
        if (Btn.classList.contains("btn-print")) { location.href = "ShowReceipt" + ShowReceipt }
      }
    })
    .catch((err) => { return location.href = "/Error" })
}
// Function Add Or Remove Row Item 
function AddOrRemoveItem(event) {
  let btn = event.target;
  let parent = btn.parentElement.parentElement.parentElement.parentElement

  if (btn.classList.contains('btn-Delete')) {
    parent.remove()
  } else {
    $('.Table-body').append(`<tr> ${RowFixed}</tr>`);
    document.querySelector(".Table-Container").scrollTop = 1000
  }

  let Rows = Table.querySelectorAll('tr')
  Rows.forEach((Row, index) => {
    if (Rows.length - 1 == index) {
      Row.querySelector("button").classList.replace("btn-Delete", "btn-plus")
      Row.querySelector("button").classList.replace("bx-trash", "bx-plus")
      Row.querySelector(".tooltip").innerText = "اضافة صنف"
    } else {
      Row.querySelector("button").classList.replace("btn-plus", "btn-Delete")
      Row.querySelector("button").classList.replace("bx-plus", "bx-trash")
      Row.querySelector(".tooltip").innerText = "حذف الصنف"
    }
  });
  SetName()
  TotalReceipt()
}
// Function TotalItem
function TotalItem(event) {
  let input = event.target;
  let parent = input.parentElement.parentElement
  let Quantity = parent.querySelector('.QtyItem').value
  let PriceItem = parent.querySelector('.PriceItem').value
  parent.querySelector('.TotalItem').value = (1 * PriceItem).toFixed(2)
  TotalReceipt()
}
// Function TotalReceipt and Profit 
function TotalReceipt() {
  let Rows = Table.querySelectorAll('tr')
  let Total = 0;
  Rows.forEach(Row => {
    Total = Total + parseFloat(Row.querySelector('.TotalItem').value)
  });
  document.querySelector('.TotalReceipt').innerText = (Total).toFixed(2)
}
// Function Focus Input
function FocusInput(event) {
  let btn = event.target
  let parent = btn.parentElement.parentElement;
  let select = parent.querySelector(".SelectMenu")
  select.classList.add("active")
  parent.classList.add("active")
  parent.querySelector(".SearchInput").focus()
}
// Function Blur Input
function BlurInput(event) {
  let btn = event.target;
  let parent = btn.parentElement.parentElement.parentElement
  let input = parent.querySelectorAll("input")[0]
  setTimeout(() => {
    let select = parent.querySelector(".SelectMenu")
    select.classList.remove("active")
    if (input.value == "الاسم" || input.value == "الصنف") { parent.classList.remove("active") }
  }, 200);
}
// Function SetName into Input
function SetName() {
  let SelectItem = document.querySelectorAll(".SelectItmes h3")
  SelectItem.forEach(item => {
    item.addEventListener("click", function () {
      let parent = item.parentElement.parentElement.parentElement
      parent.querySelectorAll("input")[0].value = item.innerText
      parent.querySelectorAll("input")[0].id = item.id
      parent.querySelectorAll("input")[1].value = ""
      parent.querySelector(".SelectMenu").classList.remove("active")
    })
  });
} SetName()
// Function Search Select
function SearchSelect(event) {
  let input = event.target;
  let parent = input.parentElement.parentElement
  let SelectItmes = parent.querySelector(".SelectItmes")
  SelectItmes.innerHTML = ""
  if (input.classList.contains("Person")) {
    Customers.forEach(Customer => {
      if (Customer.Name.includes(input.value)) {
        SelectItmes.innerHTML += `<h3 onclick="SetName(event)" id="${Customer._id}">${Customer.Name}</h3>`
      }
    });
  }
}