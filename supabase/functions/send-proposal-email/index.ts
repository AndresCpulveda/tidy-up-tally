const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, subject, bodyText, attachments } = await req.json();

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: "Recipient email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Resend payload
    const emailPayload: Record<string, unknown> = {
      from: "Cleaning Proposal <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: subject || "Your Cleaning Service Documents",
      html: bodyText || "Please find the attached documents.",
    };

    // Add attachments if provided (array of { filename, content (base64) })
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      emailPayload.attachments = attachments.map((att: { filename: string; content: string }) => ({
        filename: att.filename,
        content: att.content,
      }));
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: {
      from: "Cleaning Proposal <onboarding@resend.dev>",
      to: "deicipe80@gmail.com",
      subject: "Your Cleaning Service Documents",
      // html: bodyText || "Please find the attached documents.",
      html: "<p>Hi probandoooo,</p><p>  I’d like to thank you for allowing me to visit your facility to provide you with an estimate for janitorial services.  Per our discussion, we would be cleaning your facility five times a week.  Attached, you will find a detailed estimate that outlines the scope of work, the services included, and the associated costs. Our proposal is designed to ensure your facilities are maintained to the highest standards of cleanliness and hygiene.</p><p>Here are some of the key benefits you can expect from our services:</p><ul>  <li>    We bring our own cleaning supplies and equipment, which are commercial grade.  We do not ask clients to buy our supplies or equipment.  We make sure our clients get properly serviced in a professional manner  </li>  <li>    Besides cleaning, our cleaning products, also, sanitize and disinfect.  When a product disinfects, it kills germs, bacteria, and viruses, which is important nowadays.  We do not use household cleaning products that could make your floors sticky, and not disinfected.  Moreover, our products will not damage your flooring  </li>  <li>    Color coding for cleaning rags.  Red for toilets, yellow for the rest of the bathroom, green for other surfaces in the office, and blue for glass and mirror.  We do not cross-contaminate.  In other words, there is no chance we use the same rags in the bathroom and the kitchen  </li>  <li>    A consistent and professional system to clean.  We come to the site with a designed plan to clean your office (please see cleaning specs in the attachment).  We are not a mom-and pop shop.  Office Pride has been in service for over 30 years  </li>  <li>    An assigned supervisor to make sure we provide the service we have agreed.  Many companies promise what we promise, but few make sure of the execution.  Our supervisors are trained to execute on our promises  </li>  <li>    We are insured and bonded  </li>  <li>    We offer a 2% discount on your total monthly invoice if you pay electronically and within 10 days after invoice was sent out.  </li></ul><p>  Please find the for your review.</p><p>  The quote is for <u><strong>$${totalBill.toFixed(2)}/month</strong></u>. We know we provide the best value in the market and we will be honored to prove that to you.  Our team is equipped with the expertise, equipment, and dedication to deliver these benefits consistently. We take pride in our attention to detail and our commitment to meeting your specific cleaning needs.</p><p>  If you have any questions or need further clarification on the estimate, please do not hesitate to reach out. I am available to discuss any aspect of the proposal at your convenience.</p><p>  Thank you for considering Office Pride Commercial Cleaning Services as your trusted partner in maintaining a clean and healthy work environment. We look forward to the opportunity to work with you. Have a wonderful day!</p><p>  Best regards,<br/>  <strong>${settings.companyName}</strong></p></div>"
    }
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(
        JSON.stringify({ error: data.message || "Failed to send email" }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});