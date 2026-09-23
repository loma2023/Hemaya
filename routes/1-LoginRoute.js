const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Mailer = require('nodemailer');
require('dotenv').config();

const transporter = Mailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MY_EMAIL,
    pass: "sojjyaprnzzeokbk",
  }
});

const { RequireAuth, UnRequireAuth, CheckIfUser } = require("../middleware/middleware");
const HemayaUser = require("../models/HemayaSchema");
const Msg = require("../messages/Msg");

router.get("/", UnRequireAuth, (req, res) => {
  res.render("Auth/Login", { Title: "Login" });
});

router.get("/Login", UnRequireAuth, (req, res) => {
  res.render("Auth/Login", { Title: "Login" });
});

router.get("/Activation", (req, res) => {
  res.render("Auth/Activation", { Title: "Activation" });
});

router.get("/ForgotPassword", (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.render("Auth/ForgotPassword", { Title: "ForgotPassword" });
});


/* =========================================================
   CHECK IF EMAIL EXISTS (تمت إضافتها لأنها كانت مفقودة)
========================================================= */
router.post("/isCurrentEmail", async (req, res) => {
  try {
    const CheckUser = await HemayaUser.findOne({ Email: req.body.Email });
    if (CheckUser) {
      return res.json({ id: "Error", txt: "البريد الإلكتروني مستخدم مسبقاً" });
    }
    res.json(Msg.Success);
  } catch (err) {
    console.error("Email Check Error:", err);
    return res.json(Msg.Error);
  }
});


/* =========================================================
   REGISTER ROUTE (تمت إضافتها لأنها كانت مفقودة تماماً)
========================================================= */
router.post("/Register", async (req, res) => {
  try {
    const { 
      Username, Phone, Address, Email, Password, 
      NameCompany, TypeCompany, LogoCompany, 
      CityCompany, AddressCompany, PhoneCompany1, PhoneCompany2 
    } = req.body;

    // التحقق إن كان المستخدم موجوداً مسبقاً
    const existingUser = await HemayaUser.findOne({ Email });
    if (existingUser) {
      return res.json({ id: "Error", txt: "البريد الإلكتروني مسجل مسبقاً" });
    }

    // تشفير كلمة المرور
    const HashedPassword = bcrypt.hashSync(Password, 10);

    // إنشاء مستخدم جديد بناءً على الـ Schema
    const newUser = new HemayaUser({
      Username,
      Phone,
      Address,
      Email,
      Password: HashedPassword,
      NameCompany,
      TypeCompany,
      LogoCompany,
      CityCompany,
      AddressCompany,
      PhoneCompany1,
      PhoneCompany2,
      ActivedAt: new Date(),
      Plan: "Month" // خطة افتراضية أو حسب النظام لديك
    });

    await newUser.save();
    res.json(Msg.Success);

  } catch (err) {
    console.error("Register Server Error:", err);
    return res.json({ id: "Error", txt: err.message || "حدث خطأ أثناء التسجيل" });
  }
});


/* =========================================================
   LOGIN
========================================================= */
router.post("/Login", async (req, res) => {
  let CheckUser, UserData, TypeUser, Permissions = [];
  try {
    CheckUser = await HemayaUser.findOne({ Email: req.body.Email });
    if (CheckUser) { TypeUser = "Owner"; UserData = CheckUser; }
    if (!CheckUser) {
      CheckUser = await HemayaUser.findOne({ "UsersData.Email": req.body.Email });
      if (CheckUser) { 
        TypeUser = "User"; 
        UserData = CheckUser.UsersData.find((item) => item.Email == req.body.Email); 
      }
      if (!CheckUser) {
        return res.json(Msg.WrongEmail);
      }
    }
    const match = await bcrypt.compare(req.body.Password, UserData.Password);
    if (!match) { return res.json(Msg.WrongEmail); }
    if (TypeUser === "User") { Permissions = UserData.Permissions; }
    
    let Code = {
      ID: CheckUser._id,
      UserID: UserData._id,
      Username: UserData.Username,
      Userimg: UserData.Userimg,
      Email: UserData.Email,
      Phone: UserData.Phone,
      Address: UserData.Address,
      Password: UserData.Password,
      VoiceMessage: UserData.VoiceMessage,
      Notifications: UserData.Notifications,
      DarkMood: UserData.DarkMood,
      TypeUser: TypeUser,
      Permissions: Permissions,
      DollarKey: process.env.DOLLAR_KEY,
    };

    let MaxAgeValue = 14; 
    if (CheckUser.Plan === "Month") { MaxAgeValue = 30; }
    if (CheckUser.Plan === "Year") { MaxAgeValue = 360; }
    if (CheckUser.Plan === "Lifetime") { MaxAgeValue = 1000000; }

    let MaxAge = Math.floor((new Date() - new Date(CheckUser.ActivedAt)) / 86400000);
    if (MaxAge >= MaxAgeValue) { return res.json(Msg.MaxAge); }

    let Diff = MaxAgeValue - MaxAge;
    if (Diff <= 2) {
      HemayaUser.updateOne({ _id: CheckUser._id }, {
        $push: {
          NotificationsData: {
            Username: "تذكير بموعد الاشتراك", 
            Text: `متبقي علي موعد دفع الاشتراك ${Diff} يوم`, 
            Icon: "bx bx-calendar", 
            CreatedAt: new Date(),
          },
        }
      }).catch((err) => { console.error(err); });
    }

    let token = jwt.sign(Code, process.env.JWT_SECRET_KEY);
    res.cookie("jwt", token, { httpOnly: true, maxAge: 86400000 });
    res.json(Msg.Success);
  }
  catch (err) { 
    console.error("Login Error:", err);
    return res.json(Msg.Error); 
  }
});


/* =========================================================
   FORGOT PASSWORD
========================================================= */
let ForgotObj = { ID: "", };
router.post("/ForgotPassword", async (req, res) => {
  let CheckUser; let TypeUser; let UserData; let CodeTxt = '';
  try {
    CheckUser = await HemayaUser.findOne({ Email: req.body.Email });
    if (CheckUser) { TypeUser = "Owner"; UserData = CheckUser; }
    if (!CheckUser) {
      CheckUser = await HemayaUser.findOne({ "UsersData.Email": req.body.Email });
      if (CheckUser) { 
        TypeUser = "User"; 
        UserData = CheckUser.UsersData.find((item) => item.Email == req.body.Email); 
      }
      if (!CheckUser) {
        return res.json(Msg.WrongEmail);
      }
    }

    const hexString = "0123456789";
    for (let i = 0; i < 6; i++) {
      CodeTxt += hexString[Math.floor(Math.random() * hexString.length)];
    }
    const EmailObj = {
      from: process.env.MY_EMAIL,
      to: req.body.Email,
      subject: 'Verification Email',
      html: `${Msg.DesignGamilMsg || ''}
      <div class="DetailsMsg">
          <p>عزيزي ${UserData.Username}</p>
          <p>لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك</p>
          <p>أدخل رمز إعادة تعيين كلمة المرور التالي</p>
          <h3>${CodeTxt}</h3>
      </div>
      <div class="Note">
            <span>اذا لم تكن انت تجاهل ذلك !</span>
        </div>
      </div></body></html>`
    };

    let SendMail = await transporter.sendMail(EmailObj);
    if (SendMail) {
      ForgotObj = {
        ID: UserData._id,
        CodeTxt: CodeTxt,
        TypeUser: TypeUser,
      };
      res.json(Msg.SendMail);
    } else {
      res.json(Msg.NotSendMail);
    }
  }
  catch (err) { 
    console.error("ForgotPassword Error:", err);
    return res.json(Msg.Error); 
  }
});


/* =========================================================
   RESET PASSWORD
========================================================= */
router.post("/ResetPassword", async (req, res) => {
  try {
    if (req.body.CodeTxt === ForgotObj.CodeTxt) { 
      res.json(Msg.Success); 
    } else { 
      res.json(Msg.WrongCode); 
    }
  }
  catch (err) { 
    console.error("ResetPassword Error:", err);
    return res.json(Msg.Error); 
  }
});


/* =========================================================
   NEW PASSWORD
========================================================= */
router.post("/NewPassword", async (req, res) => {
  let HashedPassword = bcrypt.hashSync(req.body.Password, 10);

  try {
    if (ForgotObj.TypeUser === "Owner") {
      await HemayaUser.updateOne({ _id: ForgotObj.ID },
        { Password: HashedPassword }
      );
    }
    if (ForgotObj.TypeUser === "User") {
      await HemayaUser.updateOne({ "UsersData._id": ForgotObj.ID },
        { "UsersData.$.Password": HashedPassword }
      );
    }
    res.json(Msg.Success);
  }
  catch (err) { 
    console.error("NewPassword Error:", err);
    return res.json(Msg.Error); 
  }
});


module.exports = router;
