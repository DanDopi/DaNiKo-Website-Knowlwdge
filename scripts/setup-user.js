const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function setupUser() {
  console.log('🔧 Setting up your Knowledge Library user...\n')
  
  const username = await new Promise(resolve => {
    rl.question('Enter your username: ', resolve)
  })
  
  const password = await new Promise(resolve => {
    rl.question('Enter your password: ', resolve)
  })
  
  try {
    const response = await fetch('http://localhost:3000/api/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log(`\n✅ User created successfully!`)
      console.log(`Username: ${data.username}`)
      console.log(`\n🌐 You can now login at: http://localhost:3000/login`)
    } else {
      console.log(`\n❌ Error: ${data.error}`)
    }
  } catch (error) {
    console.log(`\n❌ Error connecting to server. Make sure the app is running with: npm run dev`)
    console.log(`Error: ${error.message}`)
  }
  
  rl.close()
}

setupUser()