import officePrideLogo from "@/assets/office-pride-logo.png";
import hollywoodChamberLogo from "@/assets/email-signature/hollywood-chamber-logo.png";
import ifmaLogo from "@/assets/email-signature/ifma-logo.png";

const cache = new Map<string, string>();

async function toDataUri(url: string): Promise<string> {
  if (cache.has(url)) return cache.get(url)!;
  const res = await fetch(url);
  const blob = await res.blob();
  const dataUri: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  cache.set(url, dataUri);
  return dataUri;
}

export async function buildEmailSignature(): Promise<string> {
  const [opLogo, chamberLogo, ifma] = await Promise.all([
    toDataUri(officePrideLogo),
    toDataUri(hollywoodChamberLogo),
    toDataUri(ifmaLogo),
  ]);

  return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 13px; color: #333; line-height: 1.5; margin-top: 24px;">
  <tr>
    <td>
      <p style="margin: 0 0 12px;">Best regards,</p>
      <br>
      <p style="margin: 0; font-size: 17px; color: #009739;"><strong>Carlos Egusquiza | Owner</strong></p>
      <p style="margin: 2px 0 0;"><strong>Office Pride Commercial Cleaning Services</strong></p>
      <p style="margin: 2px 0 0;">Fort Lauderdale - Hollywood</p>
      <p style="margin: 2px 0 0;">O: 954.998.3518 | C: 317.679.3294</p>
      <p style="margin: 2px 0 12px;">
        <a href="https://www.officepride.com/0401"; text-decoration: none;">OfficePride.com/0401</a>
      </p>
    </td>
  </tr>
  <tr>
    <td>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right: 18px; vertical-align: middle;">
            <img src="${opLogo}" alt="Office Pride Commercial Cleaning Services" height="42" style="display: block; height: 42px; width: auto;" />
          </td>
          <td style="padding-right: 18px; vertical-align: middle;">
            <img src="${chamberLogo}" alt="Greater Hollywood Chamber of Commerce" height="42" style="display: block; height: 42px; width: auto;" />
          </td>
          <td style="vertical-align: middle;">
            <img src="${ifma}" alt="IFMA South Florida Chapter" height="42" style="display: block; height: 42px; width: auto;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
}
