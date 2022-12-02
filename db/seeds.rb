# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)

Task.destroy_all
Timer.destroy_all
Label.destroy_all
Avatar.destroy_all
User.destroy_all


new_user = User.new(email: "user@example.com", password: "password", username: "Nicolas")
new_user.save!
p "user created (with id #{new_user.id})"

new_avatar = Avatar.new(name: "Sherb", user: new_user)
new_avatar.save!
p "avatar created"

label_test = Label.new(name: "test")
label_test.save!
p "lavel 'test' created"

new_timer = Timer.new(started_at: Time.now, label: label_test, user: new_user)
new_timer.save!

new_task = Task.new(title: "Review Cannelle's stimulus", description: "Stimulus is a nightmare so need double review", user: new_user)
new_task.save!
new_task2 = Task.new(title: "Add avatar personalisation", description: "We should be able to choose between different persona", user: new_user)
new_task2.save!
new_task3 = Task.new(title: "Help Marine with front end", description: "Front end is the devil", user: new_user)
new_task3.save!
p "tasks created"
