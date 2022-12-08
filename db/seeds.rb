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

label_test = Label.new(name: "General tasks", user: new_user)
label_test.total_label_time = 20160000
label_test.save!
label_test2 = Label.new(name: "Coding", user: new_user)
label_test2.total_label_time = 203580000
label_test2.save!
label_test5 = Label.new(name: "Meeting & call", user: new_user)
label_test5.total_label_time = 64816000
label_test5.save!
label_test3 = Label.new(name: "Paperwork", user: new_user)
label_test3.total_label_time = 46412000
label_test3.save!
label_test4 = Label.new(name: "Testing", user: new_user)
label_test4.total_label_time = 19628000
label_test4.save!
p "labels created"

new_timer = Timer.new(started_at: Time.now, label: label_test, user: new_user, total_time: 720000, logged: true, logged_date: Date.today)
label_test.daily_label_time = new_timer.total_time
new_timer.save!
label_test.save
new_timer = Timer.new(started_at: Time.now, label: label_test2, user: new_user, total_time: 16416000, logged: true, logged_date: Date.today)
label_test2.daily_label_time = new_timer.total_time
new_timer.save!
label_test2.save
new_timer = Timer.new(started_at: Time.now, label: label_test5, user: new_user, total_time: 6408000, logged: true, logged_date: Date.today)
label_test5.daily_label_time = new_timer.total_time
new_timer.save!
label_test5.save
new_timer = Timer.new(started_at: Time.now, label: label_test3, user: new_user, total_time: 3960000, logged: true, logged_date: Date.today)
label_test3.daily_label_time = new_timer.total_time
new_timer.save!
label_test3.save
new_timer = Timer.new(started_at: Time.now, label: label_test4, user: new_user, total_time: 3240000, logged: true, logged_date: Date.today)
label_test4.daily_label_time = new_timer.total_time
new_timer.save!
label_test4.save

new_task = Task.new(title: "Implement the chat feature", user: new_user)
new_task.save!
new_task2 = Task.new(title: "Prepare bugs review", description: "For Monday meeting", user: new_user)
new_task2.save!
new_task3 = Task.new(title: "Review Cannelle's code", user: new_user)
new_task3.save!
p "tasks created"
