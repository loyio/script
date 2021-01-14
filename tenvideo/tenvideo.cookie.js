const cookieName = '腾讯视频'
const cookieKey = 'loyio_cookie_videoqq'
const authUrlKey = 'loyio_auth_url_videoqq'
const authHeaderKey = 'loyio_auth_header_videoqq'
const msignurlKey = 'loyio_msign_url_videoqq'
const msignheaderKey = 'loyio_msign_header_videoqq'
const loyio = init()

const cookieVal = $request.headers['Cookie']
if (cookieVal) {
  if ($request.url.indexOf('auth_refresh') > 0) {
    const authurl = $request.url
    const authHeader = JSON.stringify($request.headers)
    if (cookieVal) loyio.setdata(cookieVal, cookieKey)
    if (authurl) loyio.setdata(authurl, authUrlKey)
    if (authHeader) loyio.setdata(authHeader, authHeaderKey)
    loyio.msg(`${cookieName}`, '获取Cookie: 成功', '')
    loyio.log(`[${cookieName}] 获取Cookie: 成功, Cookie: ${cookieVal}`)
    loyio.log(`[${cookieName}] 获取Cookie: 成功, AuthUrl: ${authurl}`)
    loyio.log(`[${cookieName}] 获取Cookie: 成功, AuthHeader: ${authHeader}`)
  } else if ($request.url.indexOf('mobile_checkin') > 0) {
    const msignurl = $request.url
    const msignheader = JSON.stringify($request.headers)
    if (msignurl) loyio.setdata(msignurl, msignurlKey)
    if (msignheader) loyio.setdata(msignheader, msignheaderKey)
    loyio.msg(`${cookieName}`, '获取Cookie: 成功', '')
    loyio.log(`[${cookieName}] 获取Cookie: 成功, msignurl: ${msignurl}`)
    loyio.log(`[${cookieName}] 获取Cookie: 成功, msignheader: ${msignheader}`)
  } else {
    loyio.setdata(cookieVal, cookieKey)
    loyio.setdata(``, authUrlKey)
    loyio.setdata(``, authHeaderKey)
    loyio.msg(`${cookieName}`, '获取Cookie: 成功', '')
    loyio.log(`[${cookieName}] 获取Cookie: 成功, Cookie: ${cookieVal}`)
  }
}

function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
loyio.done()
