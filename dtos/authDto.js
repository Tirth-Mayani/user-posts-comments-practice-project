class RegisterUserDTO{
    constructor(body){
        this.username = body.username?.trim();
        this.display_name = body.display_name?.trim();
        this.email = body.email.trim();
        this.password = body.password.trim();
    }
}

class LoginUserDTO {
    constructor(body){
        this.email = body.email;
        this.password = body.password;
    }
}

const roleUpdateDTO = {
    constructor(body){
        this.role = body.role;
    }
}

module.exports = {
    RegisterUserDTO,
    LoginUserDTO,
    roleUpdateDTO
}