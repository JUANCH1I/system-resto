import { Resend } from 'resend'

const resend = new Resend('re_ikRZ1vfZ_KTEsbJfxBd2QuUCetHzaE1dD')
resend.apiKeys.list()
resend.domains.list()

export const resendEmail = async (email, data) => {
  console.log(email)
  console.log(data)
  try {
    const response = await resend.emails.send({
      from: 'Factura <facturas@facturas.chamuyo.vip>',
      to: email,
      subject: 'Factura electrónica',
      html: `<p>Adjunto encontrarás tu factura electrónica.</p>`,
      attachments: [
        {
          filename: 'factura.pdf',
          content: data.toString('base64'),
          type: 'application/pdf',
        },
      ],
    })
    console.log(response)
  } catch (err) {
    console.log(err)
  }
}
