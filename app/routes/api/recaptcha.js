import { json } from "@remix-run/server-runtime";
import { CAPTCHA_ID } from "~/utils";
const {
  RecaptchaEnterpriseServiceClient,
} = require("@google-cloud/recaptcha-enterprise");

export async function action({ request }) {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, 405);
  }
  const body = await request.json();
  const { token, actionName } = body;
  const projectID = "yellowingreen";

  const client = new RecaptchaEnterpriseServiceClient();
  const projectPath = client.projectPath(projectID);

  const requestAssesment = {
    assessment: {
      event: {
        token: token,
        siteKey: CAPTCHA_ID,
      },
    },
    parent: projectPath,
  };

  const [response] = await client.createAssessment(requestAssesment);

  // Check if the token is valid.
  if (!response.tokenProperties.valid) {
    console.log(
      `The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`
    );
    return null;
  }

  // Check if the expected action was executed.
  // The `action` property is set by user client in the grecaptcha.enterprise.execute() method.
  if (response.tokenProperties.action === actionName) {
    // Get the risk score and the reason(s).
    // For more information on interpreting the assessment, see:
    // https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
    console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
    response.riskAnalysis.reasons.forEach((reason) => {
      console.log(reason);
    });

    return json(response.riskAnalysis.score);
  } else {
    console.log(
      "The action attribute in your reCAPTCHA tag does not match the action you are expecting to score"
    );
    return null;
  }
}
