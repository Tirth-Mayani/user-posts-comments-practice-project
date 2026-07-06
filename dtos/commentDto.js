class createCommentDTO {
    constructor(body) {
        this.post_no = body.post_no,
        this.content = body.content
    }
}

class createReplyCommentDTO {
    constructor(body) {
        this.post_no = body.post_no,
        this.content = body.content,
        this.parent_comment_no = body.parent_comment_no
    }
}

class updateCommentDTO {
    constructor(body) {
        this.content = body.content
    }    
}

module.exports = {createCommentDTO, createReplyCommentDTO, updateCommentDTO};