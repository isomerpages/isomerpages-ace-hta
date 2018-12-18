const axios = require('axios')

// purgeCacheIfDeployed runs when code is successfully merged to the master branch.
// The function runs a while loop to check if the Netlify website has been successfully deployed.
// If so, the function breaks out of the loop and makes an API call to purge the CDN cache.

async function purgeCacheIfDeployed() {
  console.log('In purgeCacheIfDeployed')
  let deploySuccess = false
  while (!deploySuccess) {
    deploySuccess = await checkDeployState()
  }

  let purgeSuccess = false 
  while (!purgeSuccess) {
    purgeSuccess = await purgeCache()  
  }
}

async function checkDeployState() {
  try {
    console.log('Checking if site has been deployed successfully')
    let resp = await axios.get(`https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/deploys?access_token=${NETLIFY_ACCESS_TOKEN}`)

    let latestDeployStatus = resp.data[0].state
    if (latestDeployStatus === "ready") {
      console.log('Site has been successfully deployed')
      return true
    }
    console.log('Site has not been deployed')
    return false
  } catch (err) {
    console.log(err)
  }
}

async function purgeCache() {
  try {
    console.log('Purging cache')
    let resp = await axios.get(`https://${KEYCDN_API_KEY}@api.keycdn.com/zones/purge/${KEYCDN_ZONE_ID}.json`)
    if (resp.data.status === 200) {
      console.log('CDN cache has been successfully purged')
      return true
    }
    console.log('Failed to purge CDN cache')
    return false
  } catch (err) {
    console.log(err)
  }
}

purgeCacheIfDeployed()