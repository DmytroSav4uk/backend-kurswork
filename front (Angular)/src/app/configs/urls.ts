const baseUrl = 'base url';
export const imageBaseUrl = 'base url'

export const urls = {
  auth: {
    login: `${baseUrl}login`,
    register: `${baseUrl}register`,
    refreshToken: `${baseUrl}refresh`,
    getUser: `${baseUrl}user`
  },
  user: {
    update: `${baseUrl}user/update`,
    uploadProfileImage: `${baseUrl}upload-profile-picture`,
    getById: `${baseUrl}user/`
  },
  post: {
    getAll: `${baseUrl}posts`,
    getById: `${baseUrl}posts/show`,
    create: `${baseUrl}posts/create`,
    delete: `${baseUrl}posts/delete`
  },
  comment: {
    getAll: `${baseUrl}comments`,
    create: `${baseUrl}comments/create`,
    update: `${baseUrl}comments/update`,
    delete: `${baseUrl}comments/delete`,
  },
  friends:{
    getAll:`${baseUrl}friends/list`,
    accept:`${baseUrl}friends/accept`,
    reject:`${baseUrl}friends/reject`,
    send:`${baseUrl}friends/send`
  },
  messages:{
    getAll:`${baseUrl}messages/conversation?user_id=`,
    send:`${baseUrl}messages/send`,
    changeDelete:`${baseUrl}messages/`
  }
}


