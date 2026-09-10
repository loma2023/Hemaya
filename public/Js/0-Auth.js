
/* =========================================================
   LOGIN
========================================================= */

function Login() {
  const EmailInput = document.querySelector(".Email");
  const PasswordInput = document.querySelector(".Password");

  if (!EmailInput || !PasswordInput) {
    console.error("Email or Password input not found");
    return;
  }

  fetch("/Login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      Email: EmailInput.value.trim(),
      Password: PasswordInput.value
    })
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }

      return res.json();
    })
    .then((Data) => {
      if (Data.id === "Success") {
        location.assign("/Home");
      }

      else if (Data.id === "MaxAge") {
        location.assign("/Activation");
      }

      else {
        Toast(Data.id, Data.txt);
      }
    })
    .catch((error) => {
      console.error("Login Error:", error);

      Toast("Error", "حدث خطأ أثناء تسجيل الدخول");
    });
}


/* =========================================================
   CONTAINER STEP
========================================================= */

const ItemStep = document.querySelectorAll(".ItemStep");
const ContainerStep = document.querySelectorAll(".ContainerStep");
const Btn = document.querySelector(".btn-OTP");
const CodeTxts = document.querySelectorAll(".CodeTxt");


/* =========================================================
   HELPERS
========================================================= */

function GetStep(ID) {
  if (!ContainerStep[ID]) {
    console.error("Invalid ContainerStep ID:", ID);
    return null;
  }

  return ContainerStep[ID];
}


function GetValue(Step, Selector) {
  const Element = Step.querySelector(Selector);

  return Element ? Element.value.trim() : "";
}


function CheckResponse(res) {
  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status}`);
  }

  return res.json();
}


function HandleFetchError(error, Message = "حدث خطأ، حاول مرة أخرى") {
  console.error(error);

  Toast("Error", Message);
}


/* =========================================================
   STEP 0
   YOUR INFO
========================================================= */

function YourINFO(ID) {
  const Step = GetStep(ID);

  if (!Step) return;

  const Name = Step.querySelector(".Name");
  const Phone = Step.querySelector(".Phone");
  const Email = Step.querySelector(".Email");
  const Password = Step.querySelector(".Password");
  const ConfirmPassword = Step.querySelector(".ConfirmPassword");

  if (!Name || !Phone || !Email || !Password || !ConfirmPassword) {
    console.error("Registration inputs not found");
    return;
  }

  const CheckPhone = /^[0-9\s]+$/;

  const CheckMail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  Name.classList.remove("Required");
  Phone.classList.remove("Required");
  Email.classList.remove("Required");
  Password.classList.remove("Required");
  ConfirmPassword.classList.remove("Required");


  // Check Name

  if (Name.value.trim() === "") {
    Name.classList.add("Required");

    return Toast(
      "Notification",
      "يرجى إدخال الاسم"
    );
  }


  // Check Phone

  if (Phone.value.trim() === "") {
    Phone.classList.add("Required");

    return Toast(
      "Notification",
      "يرجى إدخال رقم الهاتف"
    );
  }

  else if (!CheckPhone.test(Phone.value)) {
    Phone.classList.add("Required");

    return Toast(
      "Notification",
      "يرجى إدخال رقم هاتف صالح"
    );
  }

  else if (Phone.value.replace(/\s/g, "").length !== 8) {
    Phone.classList.add("Required");

    return Toast(
      "Notification",
      "يجب أن يكون رقم الهاتف 8 أرقام"
    );
  }


  // Check Email

  if (Email.value.trim() === "") {
    Email.classList.add("Required");

    return Toast(
      "Notification",
      "يرجى إدخال الإيميل"
    );
  }

  else if (!CheckMail.test(Email.value.trim())) {
    Email.classList.add("Required");

    return Toast(
      "Notification",
      "يرجى إدخال إيميل صالح"
    );
  }


  // Check Password

  if (Password.value.trim() === "") {
    Password.classList.add("Required");

    return Toast(
      "Notification",
      "يرجى إدخال كلمة المرور"
    );
  }


  // Check Confirm Password

  if (ConfirmPassword.value.trim() === "") {
    ConfirmPassword.classList.add("Required");

    return Toast(
      "Notification",
      "يرجى تأكيد كلمة المرور"
    );
  }


  // Compare Password

  if (Password.value !== ConfirmPassword.value) {
    ConfirmPassword.classList.add("Required");

    return Toast(
      "Notification",
      "كلمة المرور غير متطابقة"
    );
  }


  // Check Current Email

  fetch("/isCurrentEmail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      Email: Email.value.trim()
    })
  })
    .then(CheckResponse)
    .then((Data) => {

      if (Data.id === "Success") {
        GoStepNext(ID);
      }

      else {
        Toast(Data.id, Data.txt);
      }

    })
    .catch((error) => {
      HandleFetchError(
        error,
        "حدث خطأ أثناء التحقق من الإيميل"
      );
    });
}


/* =========================================================
   STEP 1
   YOUR COMPANY
========================================================= */

function YourCompany(ID) {
  const Step = GetStep(ID);

  if (!Step) return;

  const Name = Step.querySelector(".NameCompany");
  const TypeCompany = Step.querySelector(".TypeCompany");

  if (!Name || !TypeCompany) {
    console.error("Company inputs not found");
    return;
  }

  Name.classList.remove("Required");
  TypeCompany.classList.remove("Required");


  // Check Name Company

  if (Name.value.trim() === "") {
    Name.classList.add("Required");

    return Toast(
      "Notification",
      "يرجى إدخال اسم النشاط"
    );
  }


  // Check Type Company

  if (TypeCompany.value.trim() === "") {
    TypeCompany.classList.add("Required");

    return Toast(
      "Notification",
      "يرجى إدخال نوع النشاط"
    );
  }


  // Register

  Register(ID);
}


/* =========================================================
   REGISTER
========================================================= */

let IsRegistering = false;


function Register(ID) {

  if (IsRegistering) return;

  const UserStep = ContainerStep[0];
  const CompanyStep = ContainerStep[1];

  if (!UserStep || !CompanyStep) {
    console.error("Registration steps not found");
    return;
  }


  const Name = GetValue(UserStep, ".Name");
  const Phone = GetValue(UserStep, ".Phone");
  const Address = GetValue(UserStep, ".Address");
  const Email = GetValue(UserStep, ".Email");
  const Password = UserStep.querySelector(".Password")?.value || "";


  const NameCompany = GetValue(CompanyStep, ".NameCompany");
  const TypeCompany = GetValue(CompanyStep, ".TypeCompany");
  const LogoCompany = GetValue(CompanyStep, ".LogoCompany");
  const CityCompany = GetValue(CompanyStep, ".CityCompany");
  const AddressCompany = GetValue(CompanyStep, ".AddressCompany");
  const PhoneCompany1 = GetValue(CompanyStep, ".PhoneCompany1");
  const PhoneCompany2 = GetValue(CompanyStep, ".PhoneCompany2");


  IsRegistering = true;


  fetch("/Register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({

      Username: Name,
      Phone: Phone,
      Address: Address,
      Email: Email,
      Password: Password,

      NameCompany: NameCompany,
      TypeCompany: TypeCompany,
      LogoCompany: LogoCompany,
      CityCompany: CityCompany,
      AddressCompany: AddressCompany,
      PhoneCompany1: PhoneCompany1,
      PhoneCompany2: PhoneCompany2

    })
  })
    .then(CheckResponse)
    .then((Data) => {

      console.log("Register Response:", Data);

      if (Data.id === "Success") {
        GoStepNext(ID);
      }

      else {
        Toast(Data.id, Data.txt);
      }

    })
    .catch((error) => {

      HandleFetchError(
        error,
        "حدث خطأ أثناء التسجيل"
      );

    })
    .finally(() => {
      IsRegistering = false;
    });
}


/* =========================================================
   VERIFY OTP
========================================================= */

function Verify(link) {

  const Code = Array.from(CodeTxts)
    .map((input) => input.value)
    .join("");


  if (Code.length !== 6) {
    return Toast(
      "Notification",
      "يرجى إدخال رمز التحقق كاملًا"
    );
  }


  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      CodeTxt: Code
    })
  };


  fetch(link, options)
    .then(CheckResponse)
    .then((Data) => {

      if (Data.id === "Success") {

        if (link === "/ConfirmEmail") {
          GoStepNext(2);
        }

        else {
          GoStepNext(1);
        }

      }

      else {
        Toast(Data.id, Data.txt);
      }

    })
    .catch((error) => {

      HandleFetchError(
        error,
        "حدث خطأ أثناء التحقق من الرمز"
      );

    });
}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

function SentCodeToEmail() {

  const EmailInput = document.querySelector(".Email");

  if (!EmailInput) {
    console.error("Email input not found");
    return;
  }


  const Email = EmailInput.value.trim();


  if (Email === "") {
    return Toast(
      "Notification",
      "يرجى إدخال الإيميل"
    );
  }


  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      Email: Email
    })
  };


  fetch("/ForgotPassword", options)
    .then(CheckResponse)
    .then((Data) => {

      if (Data.id === "Success") {
        GoStepNext(0);
      }

      else {
        Toast(Data.id, Data.txt);
      }

    })
    .catch((error) => {

      HandleFetchError(
        error,
        "حدث خطأ أثناء إرسال رمز التحقق"
      );

    });
}


/* =========================================================
   NEW PASSWORD
========================================================= */

function NewPassword() {

  const PasswordInput = document.querySelector(".Password");
  const ConfirmPasswordInput =
    document.querySelector(".ConfirmPassword");


  if (!PasswordInput || !ConfirmPasswordInput) {
    console.error("Password inputs not found");
    return;
  }


  const Password = PasswordInput.value;
  const ConfirmPassword = ConfirmPasswordInput.value;


  if (Password.trim() === "") {
    return Toast(
      "Notification",
      "يرجى إدخال كلمة المرور"
    );
  }


  if (Password !== ConfirmPassword) {
    return Toast(
      "Notification",
      "كلمة المرور غير متطابقة"
    );
  }


  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      Password: Password,
      ConfirmPassword: ConfirmPassword
    })
  };


  fetch("/NewPassword", options)
    .then(CheckResponse)
    .then((Data) => {

      if (Data.id === "Success") {
        GoStepNext(2);
      }

      else {
        Toast(Data.id, Data.txt);
      }

    })
    .catch((error) => {

      HandleFetchError(
        error,
        "حدث خطأ أثناء تغيير كلمة المرور"
      );

    });
}


/* =========================================================
   GO STEP NEXT
========================================================= */

function GoStepNext(ID) {

  if (!ItemStep[ID] || !ContainerStep[ID]) {
    console.error("Invalid Step ID:", ID);
    return;
  }


  ItemStep[ID].classList.replace("active", "Done");


  const Circle = ItemStep[ID].querySelector(".circle");

  if (Circle) {
    Circle.classList.add("bx-check");
    Circle.innerText = "";
  }


  ContainerStep[ID].classList.remove("active");


  // Check if next step exists

  if (ID + 1 >= ContainerStep.length) {
    return;
  }


  ContainerStep[ID + 1].classList.add("active");


  if (ItemStep[ID + 1]) {

    ItemStep[ID + 1].classList.add("active");

  }


  const FirstInput =
    ContainerStep[ID + 1].querySelector("input");


  if (FirstInput) {
    FirstInput.focus();
  }
}


/* =========================================================
   GO STEP BACK
========================================================= */

function GoStepBack(ID) {

  if (!ItemStep[ID] || !ContainerStep[ID]) {
    console.error("Invalid Step ID:", ID);
    return;
  }


  if (ID <= 0) {
    return;
  }


  ItemStep[ID - 1].classList.replace("Done", "active");


  const Circle =
    ItemStep[ID - 1].querySelector(".circle");


  if (Circle) {
    Circle.classList.remove("bx-check");
    Circle.innerText = ID;
  }


  ItemStep[ID].classList.remove("active");

  ContainerStep[ID].classList.remove("active");

  ContainerStep[ID - 1].classList.add("active");


  const FirstInput =
    ContainerStep[ID - 1].querySelector("input");


  if (FirstInput) {
    FirstInput.focus();
  }
}


/* =========================================================
   OTP INPUTS
========================================================= */

CodeTxts.forEach((input, index) => {

  input.addEventListener("input", () => {

    // Only one digit per input

    input.value = input.value
      .replace(/\D/g, "")
      .slice(-1);


    const nextInput = CodeTxts[index + 1];


    if (nextInput && input.value !== "") {

      nextInput.removeAttribute("disabled");

      nextInput.focus();

    }


    // Activate button when all fields are filled

    const IsComplete =
      Array.from(CodeTxts).every(
        (input) => input.value !== ""
      );


    if (Btn) {

      Btn.classList.toggle("active", IsComplete);

    }

  });


  input.addEventListener("keydown", (e) => {

    if (e.key === "Backspace" && input.value === "") {

      const previousInput = CodeTxts[index - 1];


      if (previousInput) {

        input.setAttribute("disabled", true);

        previousInput.focus();

      }

    }

  });

});


/* =========================================================
   TOAST NOTIFICATIONS
========================================================= */

function Toast(id, txt) {

  const Toasts = document.querySelector(".Toasts");

  if (!Toasts) {
    console.error("Toasts container not found");
    return;
  }


  let icon = "bell";


  if (id === "Success") {
    icon = "check";
  }

  if (id === "Error") {
    icon = "x";
  }


  const length =
    Toasts.querySelectorAll(".Toast").length;


  const MyToast = `

    <div class="Toast index-${length}" id="${EscapeHTML(id)}">

      <i class="bx bx-${EscapeHTML(icon)}"></i>

      <div>
        <h4>${EscapeHTML(id)}</h4>
        <h4 class="Toast-Txt">${EscapeHTML(txt)}</h4>
      </div>

      <i
        onclick="CloseToast(${length})"
        class="bx bx-x X-Toast">
      </i>

    </div>

  `;


  Toasts.insertAdjacentHTML("beforeend", MyToast);


  const CurrentToast =
    Toasts.querySelector(`.index-${length}`);


  if (!CurrentToast) return;


  setTimeout(() => {
    CurrentToast.classList.add("active");
  }, 100);


  setTimeout(() => {
    CloseToast(length);
  }, 5000);

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function EscapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   CLOSE TOAST
========================================================= */

function CloseToast(index) {

  const Toasts = document.querySelector(".Toasts");

  if (!Toasts) return;


  const ToastElement =
    Toasts.querySelector(`.index-${index}`);


  if (!ToastElement) return;


  ToastElement.classList.remove("active");


  setTimeout(() => {

    if (ToastElement.parentNode) {
      ToastElement.remove();
    }

  }, 500);

}
