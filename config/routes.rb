Rails.application.routes.draw do
  devise_for :users
  root to: "pages#home"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  resources :users, only: [:show] do
    resources :tasks, only: [:update, :create]
    resources :playlists, only: [:create]
    resources :labels, only: [:index, :create]
  end
  get "/users/:id/game", to: "users#game", as: "game"
  resources :tasks, only: [:destroy]
  resources :playlists, only: [:update]
  resources :labels, only: [:update, :destroy]
  resources :avatars, only: [:new, :create, :edit, :update]

  post "/timers/create", to: "timers#create", as: "create_timer"
  patch "/timers/:id/timer_label", to: "timers#set_label", as: "timer_label"
  patch "/timers/:id/pause_timer", to: "timers#pause_timer", as: "pause_timer"
  patch "/timers/:id/close_timer", to: "timers#close_timer", as: "close_timer"
  patch "/timers/:id/get_daily_times", to: "timers#get_daily_times", as: "get_daily_times"
  get "/users/:id/frontend", to: "users#front_end_test", as:"frontend"

end
