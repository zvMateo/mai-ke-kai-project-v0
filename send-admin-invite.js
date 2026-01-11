// Script to send admin invitation
const response = await fetch('http://localhost:3000/api/admin/send-invitation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'maikekaisurfhouse@gmail.com',
    invitedBy: 'Sistema Mai Ke Kai'
  })
});

const result = await response.json();
console.log('Invitation sent:', result);