!function () {
    let hash = {}
    let $form = $('#signInForm')
    $form.on('submit', (e) => {
        e.preventDefault()
        let need = ['email', 'password']
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
        $.post('/sign_in', hash)
            .then((response) => {
                window.location.href = '/'
            }, (request) => {
                //let { errors } = JSON.parse(request.responseText)
                let { errors } = request.responseJSON
                if (errors.email && errors.email === 'invalid') {
                    $form.find('[name=email]').siblings('.error').text('邮箱格式错误')
                }else if (errors.email && errors.email === 'non-existent') {
                    $form.find('[name=email]').siblings('.error').text('该邮箱未注册')
                }else if (errors.password && errors.password === 'non-matched') {
                    $form.find('[name=password]').siblings('.error').text('密码错误')
                }
            })
    })
}.call()