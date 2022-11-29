# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)

Task.destroy_all
Label.destroy_all
Timer.destroy_all
Avatar.destroy_all
User.destroy_all


new_user = User.new(email: "user@example.com", password: "password", username: "username")
new_user.save

new_avatar = Avatar.new(name:"Bob")
new_avatar.save

new_user.avatar = new_avatar

label_test = Label.new(name:"test")
label_test.save
