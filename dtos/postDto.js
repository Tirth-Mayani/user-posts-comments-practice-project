class CreatePostDTO {
    constructor(body) {
        this.user_id = body.user_id;
        this.title = body.title;
        this.description = body.description;
    }
}

module.exports = {CreatePostDTO};