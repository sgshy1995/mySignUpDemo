/******** 初始化 ************/

var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
    console.log('请指定端口号\nnode server.js 8888')
    process.exit(1)
}

var server = http.createServer(function (request, response) {
    var parsedUrl = url.parse(request.url, true)
    var pathWithQuery = request.url
    var queryString = ''
    if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
    var path = parsedUrl.pathname
    var query = parsedUrl.query
    var method = request.method

    /******** 判断路径 ************/

    console.log('含查询字符串的路径\n' + pathWithQuery)

    if (path === '/') {
        var string = fs.readFileSync('./index.html', 'utf8')
        if (!request.headers.cookie) {
            request.headers.cookie = ' '
        }
        let cookies = request.headers.cookie.split('; ')
        let hash = {}
        for (let i = 0; i < cookies.length; i++){
            let parts = cookies[i].split('=')
            let key = parts[0]
            let value = parts[1]
            hash[key] = value
        }
        let email = hash.sign_in_email
        let users = fs.readFileSync('./users.json', 'utf8')
        users = JSON.parse(users)
        let foundUser
        for (let i = 0; i < users.length; i++){
            if (users[i].email === email) {
                foundUser = users[i]
                break
            }
        }
        if (foundUser) {
            string = string.replace('游客', foundUser.email)
        }
        else {
            string = string.replace('游客', '游客')
        }
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html;charset=utf-8')
        response.write(string)
        response.end()
    } else if (path === '/style.css') {
        var string = fs.readFileSync('./style.css', 'utf8')
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/css')
        response.write(string)
        response.end()
    } else if (path === '/default.css') {
        var string = fs.readFileSync('./default.css', 'utf8')
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/css')
        response.write(string)
        response.end()
    } else if (path === '/signup.css') {
        var string = fs.readFileSync('./signup.css', 'utf8')
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/css')
        response.write(string)
        response.end()
    } else if (path === '/signin.css') {
        var string = fs.readFileSync('./signin.css', 'utf8')
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/css')
        response.write(string)
        response.end()
    } else if (path === '/jquery-3.4.1.min.js') { //请修改对应的JS路径和文件名
        var string = fs.readFileSync('./jquery-3.4.1.min.js', 'utf8') //请修改对应的JS路径和文件名
        response.statusCode = 200
        response.setHeader('Content-Type', 'application/javascript')
        response.write(string)
        response.end()
    } else if (path === '/signin.js') { //请修改对应的JS路径和文件名
        var string = fs.readFileSync('./signin.js', 'utf8') //请修改对应的JS路径和文件名
        response.statusCode = 200
        response.setHeader('Content-Type', 'application/javascript')
        response.write(string)
        response.end()
    } else if (path === '/signup.js') { //请修改对应的JS路径和文件名
        var string = fs.readFileSync('./signup.js', 'utf8') //请修改对应的JS路径和文件名
        response.statusCode = 200
        response.setHeader('Content-Type', 'application/javascript')
        response.write(string)
        response.end()
    } else if (path === '/sign_up' && method === 'GET') {
        var string = fs.readFileSync('./sign_up.html', 'utf8') //请修改对应的JS路径和文件名
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html;jcharset=utf-8')
        response.write(string)
        response.end()
    } else if (path === '/sign_up' && method === 'POST') {
        readBody(request).then((body) => {
            let strings = body.split('&')
            let hash = {}
            strings.forEach((string) => {
                let parts = string.split('=')
                let key = parts[0]
                let value = parts[1]
                hash[key] = decodeURIComponent(value) //拿到真实字符 否则有乱码
            })
            let { email, password, confirm } = hash
            //判断用户名是否包含@
            if (email.indexOf('@') === -1) {
                response.statusCode = 400
                response.setHeader('Content-Type', 'application/json;jcharset=utf-8')
                response.write(`{
                    "errors":{
                        "email": "invalid"
                    }
                }`)
            }
            //判断两次输入密码是否一致
            else if (password !== confirm) {
                response.statusCode = 400
                response.write('password not match')
            }
            else {
                let users = fs.readFileSync('./users.json', 'utf8')
                //判断数据库是否出错，若无法写入直接重置
                try {
                    users = JSON.parse(users)
                } catch (exception) {
                    users = []
                }
                //先判断用户名是否已经被注册
                let inUsed = false
                for (let i = 0; i < users.length; i++) {
                    if (users[i].email === email) {
                        inUsed = true
                        break
                    }
                }
                //若果用户名已存在 返回400 和JSON
                if (inUsed) {
                    response.statusCode = 400
                    response.setHeader('Content-Type', 'application/json;jcharset=utf-8')
                    response.write(`{
                            "errors":{
                                "email": "inused"
                            }
                        }`)
                }
                //没问题 再录入数据库
                else {
                    users.push({ email: email, password: password })
                    let usersString = JSON.stringify(users)
                    fs.writeFileSync('./users.json', usersString)
                    response.statusCode = 200
                }
            }
            response.end()
        })
    }
    else if (path === '/sign_in' && method === 'GET') {
        var string = fs.readFileSync('./sign_in.html', 'utf8') //请修改对应的JS路径和文件名
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html;jcharset=utf-8')
        response.write(string)
        response.end()
    } else if (path === '/sign_in' && method === 'POST') {
        readBody(request).then((body) => {
            let strings = body.split('&')
            let hash = {}
            strings.forEach((string) => {
                let parts = string.split('=')
                let key = parts[0]
                let value = parts[1]
                hash[key] = decodeURIComponent(value) //拿到真实字符 否则有乱码
            })
            let { email, password } = hash
            if (email.indexOf('@') === -1) {
                response.statusCode = 400
                response.setHeader('Content-Type', 'application/json;jcharset=utf-8')
                response.write(`{
                    "errors":{
                        "email": "invalid"
                    }
                }`)
            } else {
                let users = fs.readFileSync('./users.json', 'utf8')
                //判断数据库是否出错，若无法写入直接重置
                try {
                    users = JSON.parse(users)
                } catch (exception) {
                    users = []
                }
                let found = false
                let matching = false
                //判断邮箱是否存在
                for (let i = 0; i < users.length; i++) {
                    if (users[i].email === email) {
                        found = true
                        break
                    }
                }
                //如果邮箱存在，判断密码是否正确
                if (found) {
                    for (let n = 0; n < users.length; n++) {
                        if (users[n].password === password) {
                            matching = true
                            break
                        }
                    }
                    //密码正确
                    if (matching) {
                        //设置Cookie
                        response.setHeader('Set-Cookie',`sign_in_email=${email}`)
                        response.statusCode = 200
                    }
                    //密码错误
                    else {
                        response.statusCode = 401
                        response.setHeader('Content-Type', 'application/json;jcharset=utf-8')
                        response.write(`{
                        "errors":{
                            "password": "non-matched"
                        }
                        }`)
                    }
                }
                //邮箱不存在
                else {
                    response.statusCode = 401
                    response.setHeader('Content-Type', 'application/json;jcharset=utf-8')
                    response.write(`{
                    "errors":{
                        "email": "non-existent"
                    }
                    }`)
                }
            }
            response.end()
        })
    } else if (path === '/ajax') { //AJAX同源策略
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/json;charset=utf-8')
        //CORS跨域
        response.setHeader('Access-Control-Allow-Origin', 'https://sgs.com:8000')
        //JSON
        response.write(`{ 
            "note":{
                "name": "sgs",
                "age": 24,
                "content": "Hello"
            }
        }`)
        response.end()
    } else {
        response.statusCode = 404
        response.setHeader('Content-Type', 'text/html;charset=utf-8')
        response.write('出错了')
        response.end()
    }

    /******** Server开启结果 ************/
})

function readBody(request) {

    return new Promise((resolve, reject) => {
        let body = []
        request.on('data', (chunk) => { //获得data
            body.push(chunk)
        }).on('end', () => {
            body = Buffer.concat(body).toString()
            //console.log(body) 'email=0&password=1&confirm=2'
            resolve(body)
        })
    })

}

server.listen(port)
console.log('监听 ' + port + ' 成功\n本地地址 http://localhost:' + port)
console.log('注意：以下地址需修改hosts文件')
console.log('本地地址 http://frank.com:' + port)
console.log('本地地址 http://jack.com:' + port)

