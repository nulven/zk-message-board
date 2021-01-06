# Image analysis 

Test Flask backend with (make sure to run `flask run` in another terminal): 

## Table of Contents
- [API Endpoints](#api-endpoints)

## API Endpoints
- [ ] [`/api/register`](#register-user)
- [ ] [`/api/login`](#login-user)
- [ ] [`/api/logout`](#logout-user)


- [ ] [`/api/experiences - GET`](#get-experiences)
- [ ] [`/api/experiences - POST`](#post-experience)
- [ ] [`/api/experiences/:experience`](#get-experience)
- [ ] [`/api/experiences/:experience/identify`](#identify-with-experience)
- [ ] [`/api/experiences/:experience/comment`](#comment-on-experience)
- [ ] [`/api/experiences/:experience/share`](#share-experience)


- [ ] [`/api/perspectives - GET`](#get-perspectives)
- [ ] [`/api/perspectives - POST`](#post-perspective)
- [ ] [`/api/perspectives/:perspective`](#get-perspective)
- [ ] [`/api/perspectives/:perspective/share`](#share-perspective)


- [ ] [`/api/users/:user - GET`](#get-user)
- [ ] [`/api/users/:user - POST`](#edit-user-information)

- [ ] [`/api/users/:user/experiences/mine`](#get-user-experiences)
- [ ] [`/api/users/:user/experiences/saved`](#get-saved-experiences)
- [ ] [`/api/users/:user/experiences/save`](#save-experience)
- [ ] [`/api/users/:user/experiences/remove`](#remove-saved-experience)

- [ ] [`/api/users/:user/perspectives/mine`](#get-user-perspectives)
- [ ] [`/api/users/:user/perspectives/saved`](#get-saved-perspectives)
- [ ] [`/api/users/:user/perspectives/save`](#save-perspective)
- [ ] [`/api/users/:user/perspectives/remove`](#remove-saved-perspective)

- [ ] [`/api/users/:user/topic`](#get-saved-topics)
- [ ] [`/api/users/:user/topic/save`](#save-topic)
- [ ] [`/api/users/:user/topic/remove`](#remove-saved-topic)

- [ ] [`/api/users/:user/network`](#get-user-network)
- [ ] [`/api/users/:user/network/add`](#add-to-network)
- [ ] [`/api/users/:user/network/remove`](#remove-from-network)

### Details

#### Register User
  - Path: `/api/register`
  - Method: 'POST'
  - Query String:
    - `session_id`
  - Parameters
    |     Name     |   Type   |          |
    |:------------:|:--------:|:--------:|
    |    `name`    | `STRING` | Required |
    |   `email`    | `STRING` | Required |
    |  `password`  | `STRING` | Required |
    |`organization`| `STRING` |          |
    |  `position`  | `STRING` |          |
    |`description` | `STRING` |          |
    |`phone_number`| `STRING` |          |
  
  TODO: SEND PICTURE

#### Login User
  - Path: `/api/login`
  - Method: 'POST'
  - Query String:
    - `session_id`

#### Logout User
  - Path: '/api/logout'
  - Method: 'POST'
  - Query String:
    - `session_id`

#### Get Experiences
  - Method: 'GET'
  - Parameters
    |    Name    |    Type   |          |
    |:----------:|:---------:|:--------:|
    | `topic_id` | `INTEGER` | Required |

#### Post Experience
  - Path: `/api/experience`
  - Method: 'POST'
  - Query String:
    - `session_id`
    - type`: 'TEXT' | 'AUDIO'
  - Parameters
    |   Name   |     Type    |          |
    |:--------:|:-----------:|:--------:|
    | `title`  |   `STRING`  | Required |
    | `topics` | `INTEGER[]` | Required |

  TODO: SEND AUDIO OR TEXT

#### Get Experience
  - Path: `/api/experience/:experience`
  - Method: 'GET'

#### Identify With Experience
  - Path: `/api/experience/:experience/identify`
  - Method: 'POST'
  - Query String:
    - `session_id`

#### Comment On Experience
  - Path: `/api/experience/:experience/comment`
  - Method: 'POST'
  - Query String:
    - `session_id`
  - Parameters
    |   Name    |   Type   |          |
    |:---------:|:--------:|:--------:|
    | `comment` | `STRING` | Required |

#### Share Experience
  - Path: `/api/experiences/:experience/share`
  - Method: 'POST'
  - Parameters
    |    Name   |    Type   |          |
    |:---------:|:---------:|:--------:|
    | `user_id` | `INTEGER` | Required |


#### Get Perspectives
  - Path: `/api/perspectives`
  - Method: 'GET'
  - Parameters
    |    Name    |    Type   |          |
    |:----------:|:---------:|:--------:|
    | `topic_id` | `INTEGER` | Required |

#### Post Perspective
  - Path: `/api/perspectives`
  - Method: 'POST'
  - Query String:
    - `session_id`
    - type`: 'TEXT' | 'AUDIO'
  - Parameters
    |   Name   |     Type    |          |
    |:--------:|:-----------:|:--------:|
    | `title`  |   `STRING`  | Required |
    | `topics` | `INTEGER[]` | Required |

  TODO: SEND AUDIO OR TEXT

#### Get Perspective 
  - Path: `/api/perspectives/:perspective`
  - Method: 'GET'

#### Identify With Perspective 
  - Path: `/api/perspectives/:perspective/identify`
  - Method: 'POST'
  - Query String:
    - `session_id`

#### Share Perspective 
  - Path: `/api/perspectives/:perspective/share`
  - Method: 'POST'
  - Parameters
    |    Name   |    Type   |          |
    |:---------:|:---------:|:--------:|
    | `user_id` | `INTEGER` | Required |

#### Get User
  - Path: `/api/users/:user`
  - Method: 'GET'
  - Query String:
    - `session_id`

#### Edit User Information
  - Path: `/api/users/:user`
  - Method: 'POST'
  - Query String:
    - `session_id`
  - Parameters
    |     Name     |   Type   |          |
    |:------------:|:--------:|:--------:|
    |    `name`    | `STRING` | Required |
    |   `email`    | `STRING` | Required |
    |  `password`  | `STRING` | Required |
    |`organization`| `STRING` |          |
    |  `position`  | `STRING` |          |
    |`description` | `STRING` |          |
    |`phone_number`| `STRING` |          |

  TODO: SEND PICTURE

#### Get User Experiences
  - Path: `/api/users/:user/experiences/mine`
  - Method: 'GET'
  - Query String:
    - `session_id`

#### Get Saved Experiences
  - Path: '/api/users/:user/experiences/saved'
  - Method: 'GET'
  - Query String:
    - `session_id`

#### Save Experience
  - Path: `/api/users/:user/experiences/save`
  - Method: 'POST'
  - Query String:
    - `session_id`
  - Parameters
    |      Name       |   Type    |          |
    |:---------------:|:---------:|:--------:|
    | `experience_id` | `INTEGER` | Required |

#### Remove Saved Experience
  - Path: `/api/users/:user/experiences/remove`
  - Method: 'POST'
  - Query String:
    - `session_id`
  - Parameters
    |      Name       |   Type    |          |
    |:---------------:|:---------:|:--------:|
    | `experience_id` | `INTEGER` | Required |

#### Get User Perspectives
  - Path: `/api/users/:user/perspectives/mine`
  - Method: 'GET'
  - Query String:
    - `session_id`

#### Get Saved Perspectives
  - Path: `/api/users/:user/perspectives/saved`
  - Method: 'GET'
  - Query String:
    - `session_id`

#### Save Perspective
  - Path: `/api/users/:user/perspectives/save`
  - Method: 'POST'
  - Query String:
    - `session_id`
  - Parameters
    |       Name       |   Type    |          |
    |:----------------:|:---------:|:--------:|
    | `perspective_id` | `INTEGER` | Required |

#### Remove Saved Perspective
  - Path: `/api/users/:user/perspectives/remove`
  - Method: 'POST'
  - Query String:
    - `session_id`
  - Parameters
    |       Name       |   Type    |          |
    |:----------------:|:---------:|:--------:|
    | `perspective_id` | `INTEGER` | Required |

#### Get Saved Topics
  - Path: `/api/users/:user/topic`
  - Method: 'GET'
  - Query String:
    - `session_id`

#### Save Topic
  - Path: `/api/users/:user/topic/save`
  - Method: 'POST'
  - Query String:
    - `session_id`
  - Parameters
    |    Name    |   Type    |          |
    |:----------:|:---------:|:--------:|
    | `topic_id` | `INTEGER` | Required |

#### Remove Saved Topic
  - Path: `/api/users/:user/topic/remove`
  - Method: 'POST'
  - Query String:
    - `session_id`
  - Parameters
    |    Name    |   Type    |          |
    |:----------:|:---------:|:--------:|
    | `topic_id` | `INTEGER` | Required |

#### Get User Network
  - Path: `/api/users/:user/network`
  - Method: 'GET'

#### Add To Network
  - Path: `/api/users/:user/network/add`
  - Method: 'POST'
  - Query String:
    - `session_id`
  - Parameters
    |   Name    |   Type    |          |
    |:---------:|:---------:|:--------:|
    | `user_id` | `INTEGER` | Required |

#### Remove From Network
  - Path: `/api/users/:user/network/remove`
  - Method: 'POST'
  - Query String
    - `session_id`
  - Parameters
    |   Name    |   Type    |          |
    |:---------:|:---------:|:--------:|
    | `user_id` | `INTEGER` | Required |
