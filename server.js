var express = require("express");
var fileuploader = require("express-fileupload");
var mysql2 = require("mysql2");
var cloudinary = require("cloudinary").v2;
var app = express();


app.use(fileuploader());//to recv. and upload pic on server from client

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyD4L1wOOUH7PWI10p3NYgZY7__x2xQ2ApQ");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


//for style and script files
app.use(express.static("public"));
app.use(express.urlencoded(true)); //convert POST data to JSON object
app.post("/abc", async function (req, resp) {
  console.log(req.body);
  let txt = req.body.txtttt;

  let prompt = txt + " Give response in JSON object with key message"

  const result = await model.generateContent(prompt);

  resp.send(result.response.text());

})
async function RajeshBansalKaChirag(imgurl) {
  const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."
  const imageResp = await fetch(imgurl)
    .then((response) => response.arrayBuffer());

  const result = await model.generateContent([
    {
      inlineData: {
        data: Buffer.from(imageResp).toString("base64"),
        mimeType: "image/jpeg",
      },
    },
    myprompt,
  ]);
  console.log(result.response.text())

  const cleaned = result.response.text().replace(/```json|```/g, '').trim();
  const jsonData = JSON.parse(cleaned);
  console.log(jsonData);

  return jsonData

}

app.post("/server-upload", async function (req, resp) {
  let acardpicurl = "";
  let profilepiccurl = "";
  if (req.files != null) {
    let fName = req.files.profilepic2.name;
    let fullPath = __dirname + "/public/uploads/" + fName;
    req.files.profilepic2.mv(fullPath);//move is the inbuilt function use to move the data in files
    await cloudinary.uploader.upload(fullPath).then(async function (picUrlResult) {

      acardpicurl = picUrlResult.url;
      //will give u the url of ur pic on cloudinary server
      console.log(acardpicurl);
      //resp.send(picurl);//await and async are promises
    });

    let fName2 = req.files.profilepic1.name;
    let fullPath2 = __dirname + "/public/uploads/" + fName2;
    req.files.profilepic1.mv(fullPath2);//move is the inbuilt function use to move the data in files
    await cloudinary.uploader.upload(fullPath2).then(function (picUrlResult) {
      profilepiccurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
      console.log(profilepiccurl);
      //resp.send(picurl);//await and async are promises
    });

  }
  else {
    acardpicurl = "nopic.jpg";
    profilepiccurl = "nopic.jpg";
  }

  let fileName = "";
  if (req.files != null) {
    //const myprompt = "Read the text on picture and tell all the information";
    //  const myprompt = "Read the text on picture in JSON format";
    fileName = req.files.profilepic2.name;
    let locationToSave = __dirname + "/public/uploads/" + fileName;
    //full ile path

    req.files.profilepic2.mv(locationToSave);//saving file in uploads folder

    //saving ur file/pic on cloudinary server
    try {
      await cloudinary.uploader.upload(locationToSave).then(async function (picUrlResult) {

        let jsonData = await RajeshBansalKaChirag(picUrlResult.url);
        let emailid = req.body.txtEmail5;
        let name = jsonData.name;
        let dob = jsonData.dob;
        let gender = jsonData.gender;
        let address = req.body.txtAdd1;
        let game = req.body.txtGame;
        let contact = req.body.txtCon1;
        let otherinfo = req.body.txtOth1;
        mySqlVen.query("insert into players values(?,?,?,?,?,?,?,?,?,?)", [emailid, acardpicurl, profilepiccurl, name, dob, gender, address, contact, game, otherinfo], function (errKuch) {
          if (errKuch == null)
            resp.send("Record Saved Successfulllyyy....Badhai");
          else
            resp.send(errKuch.message);
        })

        //resp.send(jsonData);

      });

      //var respp=await run("https://res.cloudinary.com/dfyxjh3ff/image/upload/v1747073555/ed7qdfnr6hez2dxoqxzf.jpg", myprompt);
      // resp.send(respp);
      // console.log(typeof(respp));
    }
    catch (err) {
      resp.send(err.message)
    }

  }
})


app.get("/", function (req, resp) {

  // resp.sendFile();
  let dirName = __dirname;//Global Variable for path of current directory
  //let filename=__filename;
  //resp.send(dirName+"  <br>     "+filename);
  let fullpath = dirName + "/public/players-details.html";
  resp.sendFile(fullpath);
})



//--------------------------------------------------------






app.listen(2006, function () {
  console.log("Server Started");
})





app.get("/hello", function (req, resp) {
  resp.contentType("text/html");
  resp.write("hellooo!!!");
  resp.end();
})
app.get("/y", function (req, resp) {
  console.log(__dirname);
  let path = __dirname + "/public/dash-organizer.html";
  resp.sendFile(path);
})
app.get("/orgdetails-page", function (req, resp) {
  console.log(__dirname);
  let path = __dirname + "/public/org-details.html";
  resp.sendFile(path);
})
/*app.get("/", function (req, resp) {
  console.log(__dirname);
  let path = __dirname + "/public/dash-player.html";
  resp.sendFile(path);
})*/
/*app.get("/", function (req, resp) {
  console.log(__dirname);
  let path = __dirname + "/public/index.html";
  resp.sendFile(path);
})*/
cloudinary.config({
  cloud_name: 'drerultoi',
  api_key: '388826259734339',
  api_secret: 't1W862cSH4BeleuZBU0G8Kre_2s',//go to cloudinary and in view api key and copy every info
});

//==========Aiven started===============
let dbconf = "mysql://avnadmin:AVNS_eSkXsRwRJ8bC2FonFNV@mysql-432026c-kanangarg95-92ee.c.aivencloud.com:16750/defaultdb?";
let mySqlVen = mysql2.createConnection(dbconf);//now to create connnection with aiven jb node mein hum kuch kre voh sidha aiven pr chle;
mySqlVen.connect(function (errKuch) {// err property is must to give so that we can check ki node ka connection with mysql huya ya nhi
  if (errKuch == null)
    console.log("Aiven connection successfully........");
  else
    console.log(errKuch);
})
app.get("/server-signup", function (req, resp) {
  let emailid = req.query.txtEmail;
  let password = req.query.txtPwd;
  let utype = req.query.comboUser;
  mySqlVen.query("insert into ussers2025 values(?,?,?,current_date(),?)", [emailid, password, utype, 1], function (errKuch) {
    if (errKuch == null)
      resp.send("Record Saved Successfulllyyy....Badhai");
    else
      resp.send(errKuch.message);
  })
})

app.get("/do-login", function (req, resp) {
  //console.log(req.query.txtEmail);
  let emailid = req.query.txtEmail2;
  let password = req.query.txtPwd2;

  mySqlVen.query("select * from  ussers2025 where emailid=? and password=? ", [emailid, password], function (errKuch, allRecords) {
    if (errKuch == null) {
      if (allRecords.length == 0) {
        resp.send("Invalid");
      } else if (allRecords[0].status == 0) {
        resp.send("Blocked");
      } else {
        resp.json(allRecords[0].utype);
      }
    }
    else
      resp.send(errKuch.message);

  })
})

app.post("/server-signup2", async function (req, resp) {
  let picurl = "";
  if (req.files != null) {
    let fName = req.files.profilepic.name;
    let fullPath = __dirname + "/public/uploads/" + fName;
    req.files.profilepic.mv(fullPath);//move is the inbuilt function use to move the data in files
    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
      picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
      console.log(picurl);
      //resp.send(picurl);//await and async are promises
    });
  }
  else
    picurl = "nopic.jpg";


  let emailid = req.body.txtEmail3;
  let orgname = req.body.txtOrg;
  let regnumber = req.body.txtReg;
  let address = req.body.txtAdd;
  let city = req.body.txtCity;
  let sports = req.body.txtSports;
  let established = req.body.txtEst;
  let website = req.body.txtWeb;
  let insta = req.body.txtInst;
  let head = req.body.txtHead;
  let contactno = req.body.txtCon;
  let otherinfo = req.body.txtOth;
  mySqlVen.query("insert into organizers2025 values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [null, emailid, orgname, regnumber, address, city, sports, established, website, insta, head, contactno, picurl, otherinfo], function (errKuch) {
    if (errKuch == null)
      resp.send("Record Saved Successfulllyyy....Badhai");
    else
      resp.send(errKuch);
  })
})
app.post("/update-user", async function (req, resp) {

  let picurl = "";
  if (req.files != null) //user wants you to update the profilepic
  {
    fName = req.files.profilepic.name;//accept the pic in server
    let fullPath = __dirname + "/public/uploads/" + fName;//it provide the path to sent it to the server
    req.files.profilepic.mv(fullPath);//move is the inbuilt function use to move the data in files
    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
      picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
      console.log(picurl);//await and async are promises
    });
  }
  else
    picurl = req.body.hdn;//vhin pic jo h repeat ho jaye

  let emailid = req.body.txtEmail3;
  let orgname = req.body.txtOrg;
  let regnumber = req.body.txtReg;
  let address = req.body.txtAdd;
  let city = req.body.txtCity;
  let sports = req.body.txtSports;
  let established = req.body.txtEst;
  let website = req.body.txtWeb;
  let insta = req.body.txtInst;
  let head = req.body.txtHead;
  let contactno = req.body.txtCon;
  let otherinfo = req.body.txtOth;


  mySqlVen.query("update organizers2025 set orgname=?,regnumber=?,address=?,city=?,sports=?,established=?,website=?,insta=?,head=?,contactno=?,picurl=?,otherinfo=? where emailid=?", [orgname, regnumber, address, city, sports, established, website, insta, head, contactno, picurl, otherinfo, emailid], function (errKuch, result) {
    if (errKuch == null) {
      if (result.affectedRows == 1)
        resp.send(" Update Record Successfulllyyy....Badhai");
      else
        resp.send("Invalid email Id");
    }
    else
      resp.send(errKuch.message);
  })

})
app.get("/get-data", function (req, resp) {
  //console.log(req.query.txtEmail);
  mySqlVen.query("select * from  organizers2025 where emailid=?", [req.query.txtEmail3], function (errKuch, allRecords) {
    if (allRecords.length == 0)
      resp.send("No Record found");
    else
      resp.json(allRecords);

  })
})
app.get("/server-public", function (req, resp) {
  let emailid = req.query.txtEmail4;
  let event = req.query.txtTitle;
  let doe = req.query.txtDate;
  let toe = req.query.txtTime;
  let address = req.query.txtLoc;
  let city = req.query.txtCity;
  let sports = req.query.txtSports;
  let minage = req.query.txtMin;
  let maxage = req.query.txtMax;
  let lastdate = req.query.txtDate2;
  let fee = req.query.txtFee;
  let prize = req.query.txtPrize;
  let contact = req.query.txtCon;

  mySqlVen.query("insert into tournaments values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [null, emailid, event, doe, toe, address, city, sports, minage, maxage, lastdate, fee, prize, contact], function (errKuch) {
    if (errKuch == null)
      resp.send("Record Saved Successfulllyyy....Badhai");
    else
      resp.send(errKuch.message);
  })
})
app.use(express.urlencoded("true"));

app.post("/server-modify", async function (req, resp) {
  let acardpicurl = "";
  let profilepiccurl = "";
  let jsonData={};

  try{
      if(req.file!=null){
    let fName = req.files.profilepic2.name;
    let fullPath = __dirname + "/public/uploads/" + fName;
    req.files.profilepic2.mv(fullPath);//move is the inbuilt function use to move the data in files
    await cloudinary.uploader.upload(fullPath).then( async function (picUrlResult) {
      acardpicurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
      console.log(acardpicurl);
       jsonData = await RajeshBansalKaChirag(acardpicurl);
      //  resp.send(jsonData);
      //resp.send(picurl);//await and async are promises
    });
    let fName2 = req.files.profilepic1.name;
    let fullPath2 = __dirname + "/public/uploads/" + fName2;
    req.files.profilepic1.mv(fullPath2);//move is the inbuilt function use to move the data in files
    await cloudinary.uploader.upload(fullPath2).then(function (picUrlResult) {
      profilepiccurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
      console.log(profilepiccurl);
      //resp.send(picurl);//await and async are promises
    })
  }
  else {

    acardpicurl = req.body.hdn;
    profilepiccurl = req.body.hdn1;
  }
}
  catch{
    console.log("cloudinary crash ");
  }
  let emailid = req.body.txtEmail5;
  let name = jsonData.name;
  let dob = jsonData.dob;
  let gender = jsonData.gender;
  let address = req.body.txtAdd1;
  let game = req.body.txtGame;
  let contact = req.body.txtCon1;
  let otherinfo = req.body.txtOth1;
  mySqlVen.query("update  players set acardpicurl=?,profilepicurl=?,name=?,dob=?,gender=?,address=?,contact=?,game=?,otherinfo=? where emailid=?", [acardpicurl, profilepiccurl, name, dob, gender, address, game, contact, otherinfo, emailid], function (errKuch) {
    if (errKuch == null)
      resp.send("Update Saved Successfulllyyy....Badhai");
    else
      resp.send(errKuch);
  })
})
app.get("/get-data1", function (req, resp) {
  //console.log(req.query.txtEmail);
  mySqlVen.query("select * from  players where emailid=?", [req.query.txtEmail5], function (errKuch, allRecords) {
    if (allRecords.length == 0)
      resp.send("No Record found");
    else
      resp.json(allRecords);

  })
})
app.get("/do-fetch-all-users", function (req, resp) {
  mySqlVen.query("select * from  tournaments where emailid=?", [req.query.emailidkuch], function (err, allRecords) {
    resp.send(allRecords);
  })
})
app.get("/delete-one", function (req, resp) {
  console.log(req.query)
  let rid = req.query.ridKuch;

  mySqlVen.query("delete from tournaments where rid=? ", [rid], function (errKuch, result) {
    if (errKuch == null) {
      if (result.affectedRows == 1)
        resp.send(rid + " Deleted Successfulllyyyy...");
      else
        resp.send("rid");
    }
    else
      resp.send(errKuch);

  })
})
app.get("/do-fetch-all-users2", function (req, resp) {
  mySqlVen.query("select * from  ussers2025", function (err, allRecords) {
    resp.send(allRecords);
  })
})
app.get("/block-one", function (req, resp) {
  console.log(req.query)
  let emailid = req.query.emailidKuch;

  mySqlVen.query("update ussers2025 set status=0 where emailid=? ", [emailid], function (errKuch, result) {
    if (errKuch == null) {
      if (result.affectedRows == 1)
        resp.send(emailid + " Blocked Successfulllyyyy...");
      else
        resp.send("emailid");
    }
    else
      resp.send(errKuch.message);

  })
})
app.get("/resume-one", function (req, resp) {
  console.log(req.query)
  let emailid = req.query.emailidKuch;

  mySqlVen.query("update ussers2025 set status=1 where emailid=? ", [emailid], function (errKuch, result) {
    if (errKuch == null) {
      if (result.affectedRows == 1)
        resp.send(emailid + " Unblocked Successfulllyyyy...");
      else
        resp.send("emailid");
    }
    else
      resp.send(errKuch);

  })
})
app.get("/do-fetch-all-users3", function (req, resp) {
  mySqlVen.query("select * from  organizers2025", function (err, allRecords) {
    resp.send(allRecords);
  })
})
app.get("/delete-data", function (req, resp) {
  console.log(req.query)
  let rid = req.query.ridKuch;

  mySqlVen.query("delete from organizers2025 where rid=? ", [rid], function (errKuch, result) {
    if (errKuch == null) {
      if (result.affectedRows == 1)
        resp.send(rid + " Deleted Successfulllyyyy...");
      else
        resp.send("rid");
    }
    else
      resp.send(errKuch);

  })
})
app.get("/do-fetch-all-user", function (req, resp) {
  mySqlVen.query("select * from  players", function (err, allRecords) {
    resp.send(allRecords);
  })
})
app.get("/delete-2", function (req, resp) {
  console.log(req.query)
  let emailid = req.query.emailidKuch;

  mySqlVen.query("delete from players where emailid=? ", [emailid], function (errKuch, result) {
    if (errKuch == null) {
      if (result.affectedRows == 1)
        resp.send(rid + " Deleted Successfulllyyyy...");
      else
        resp.send("rid");
    }
    else
      resp.send(errKuch);

  })
})
/*app.get("/delete-one2", function (req, resp) {
  console.log(req.query)
  let emailid = req.query.emailidKuch;

  mySqlVen.query("delete from tournaments where emailid=? ", [emailid], function (errKuch, result) {
    if (errKuch == null) {
      if (result.affectedRows == 1)
        resp.send(emailid + " Deleted Successfulllyyyy...");
      else
        resp.send("emailid");
    }
    else
      resp.send(errKuch);

  })
})*/
app.get("/do-fetch-all-tournaments", function (req, resp) {
  // console.log(req.query)
  mySqlVen.query("select * from tournaments where city=? and sports=?", [req.query.kuchCity, req.query.kuchGame], function (err, allRecords) {
    console.log(allRecords)
    resp.send(allRecords);
  })
})
app.get("/do-fetch-all-cities", function (req, resp) {
  mySqlVen.query("select distinct city from tournaments", function (err, allRecords) {
    resp.send(allRecords);
  })
})
app.get("/do-fetch-all-sports", function (req, resp) {
  mySqlVen.query("select distinct sports from tournaments", function (err, allRecords) {
    resp.send(allRecords);
  })
})
app.get("/do-update-all-users", function (req, resp) {
  //console.log("Requested Email:", email);
  //console.log("Old Password:", oldPass);
  // console.log("New Password:", newPass);

  // console.log(req.query)
  mySqlVen.query("update ussers2025 set password=? where emailid=? and password=?", [req.query.kuchPassword2, req.query.kuchEmailid, req.query.kuchPassword1], function (err, allRecords) {
    if (err == null) {
      if (allRecords.affectedRows == 1)
        resp.send(" Update Password Successfulllyyyy...");
      else
        resp.send("Invalid Emailid");
    }
    else
      resp.send(err);

    //console.log(allRecords)
    //resp.send(allRecords);
  })
})
app.get("/get-one", function (req, resp) {
  let name1 = req.query.name2;
  let email1 = req.query.email;
  let message1 = req.query.message;
  mySqlVen.query("insert into message values(?,?,?)", [name1, email1, message1], function (errKuch) {
    if (errKuch == null)
      resp.send("WE have recieved your message.We will get back to you soon");
    else
      resp.send(errKuch.message);
  })
})