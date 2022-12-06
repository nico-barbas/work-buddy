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


new_user = User.new(email: "nicolas@email.com", password: "password", username: "Nicolas")
new_user.save!
p "user created (with id #{new_user.id})"

new_avatar = Avatar.new(name: "Sherb", user: new_user)
new_avatar.save!
p "avatar created"

label_test = Label.new(name: "No label", user: new_user)
label_test.save!
label_test2 = Label.new(name: "Coding", user: new_user)
label_test2.save!
label_test = Label.new(name: "Meeting & call", user: new_user)
label_test.save!
label_test3 = Label.new(name: "Paperwork", user: new_user)
label_test3.save!
label_test4 = Label.new(name: "Test", user: new_user)
label_test4.save!
p "label 'General tasks' created"

new_timer = Timer.new(started_at: Time.now, label: label_test, user: new_user)
new_timer.save!

new_task = Task.new(title: "Implemente the chat feature", description: "Find ressources on how to do this", user: new_user)
new_task.save!
new_task2 = Task.new(title: "Prepare bugs review", description: "For Monday meeting", user: new_user)
new_task2.save!
new_task3 = Task.new(title: "URSAFF declaration", description: "The worst part about being a freelance ", user: new_user)
new_task3.save!
p "tasks created"
