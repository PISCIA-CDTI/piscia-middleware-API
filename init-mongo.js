db.createUser({
    user: 'piscia',
    pwd: 'password',
    roles: [
        {
            role: 'readWrite',
            db: 'piscia'
        }
    ]
});
