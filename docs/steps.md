1. User
2. Post
3. Comment
4. Like         
5. Follower
6. Story
7. Message
8. Notifications
9. Saved Posts
10. Authentication
11. API Controllers
12. Services
13. Routes
14. Validation
15. Error handling
16. Testing

===================
=> for db
ex:
Like model
Like migration
Update associations
Run migration

- Controller: Handles the HTTP side: reads the request, calls the service, sends the response
- Service: Holds the business logic, which is the actual rules of your app
- Model: Defines the shape of your data: table/entity definitions, fields, types, and relations
- Utils: Small, generic helper functions with no business meaning, reusable anywhere
- repository: The only layer that talks to the database. It contains the queries.
If you change ORMs or SQL details, only this layer changes. 
Services just call repository methods and don’t care how data is fetched.
