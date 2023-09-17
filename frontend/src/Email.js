import React, { useRef } from 'react';
import emailjs from 'emailjs-com';

export const Email = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm('service_sy0vh0h', 'template_k6a6y2d', form.current, 'aqvTFfCBLWr98GhK6')
      .then((result) => {
          console.log(result.text);
      }, (error) => {
          console.log(error.text);
      });
  };

  return (
    <form ref={form} onSubmit={sendEmail}>
      <label className='reminder-email'>Send Reminder Emails</label>
      <input className="email-button" type="email" name="user_email"/>
      <button className="email-submit-button" type="submit" value="Send">Submit</button>
    </form>
  );
};

export default Email;

