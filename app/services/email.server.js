const nodemailer = require("nodemailer");

export async function sendEmail(obj) {
  // message will include address of winner and gameId
  const { winnerId, gameId } = obj;
  let transporter;
  try {
    transporter = nodemailer.createTransport({
      service: "Yahoo",
      secure: false,
      auth: {
        user: process.env.SENDEMAILFROM,
        pass: process.env.EMAILPASS,
      },
    });
  } catch (error) {
    console.log("error", error);
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SENDEMAILFROM, // sender address
      to: process.env.SENDEMAILTO, // list of receivers
      subject: `"Winner of ${gameId}`, // Subject line
      text: "Winner of Game", // plain text body
      html: `<b>Winner of Game is ${winnerId}</b>`, // html body
    });
    console.log({ info });
  } catch (error) {
    console.log(error);
  }
}
