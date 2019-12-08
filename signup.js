!function () {
    let hash = {}
    let $form = $('#signUpForm')
    $form.on('submit', (e) => {
        e.preventDefault()
        let need = ['email', 'password', 'confirm']
        need.forEach((name) => {
            let value = $form.find(`[name=${name}]`).val()
            hash[name] = value
        })
        //判断邮箱是否填写
        $form.find('.error').each((index, span) => {
            $(span).text('')
        })
        if (hash.email === '') {
            $form.find('[name=email]').siblings('.error').text('请输入邮箱')
            return
        }
        if (hash.email.indexOf('@') === -1) {
            $form.find('[name=email]').siblings('.error').text('请邮箱格式错误')
            return
        }
        if (hash.password === '') {
            $form.find('[name=password]').siblings('.error').text('请输入密码')
            return
        }
        if (hash.password !== hash.confirm) {
            $form.find('[name=confirm]').siblings('.error').text('两次密码不一致')
            return
        }
        $.post('/sign_up', hash)
            .then((response) => {
                alert('注册成功，请登录')
                window.location.href = '/sign_in'
            }, (request) => {
                //let { errors } = JSON.parse(request.responseText)
                    let { errors } = request.responseJSON
                    if (errors.email && errors.email === 'invalid') {
                        $form.find('[name=email]').siblings('.error').text('邮箱格式错误')
                    }
                     else if (errors.email && errors.email === 'inused') {
                        $form.find('[name=email]').siblings('.error').text('该邮箱已被注册')
                    }
            })
    })
}.call()