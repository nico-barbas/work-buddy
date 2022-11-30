Rails.application.routes.draw do
  devise_for :users
  root to: "pages#home"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  resources :users, only: [:show] do
    resources :tasks, only: [:update, :create]
    resources :playlists, only: [:create]
  end
  get "/users/:id/game", to: "users#game", as: "game"
  resources :tasks, only: [:destroy]
  resources :playlists, only: [:update]
  resources :avatars, only: [:new, :create]

  post "/timers/create", to: "timers#create", as: "create_timer"
  post "/timers/:id/start_timer", to: "timers#start_timer", as: "start_timer"
  post "/timers/:id/pause_timer", to: "timers#pause_timer", as: "pause_timer"
  post "/timers/:id/close_timer", to: "timers#close_timer", as: "close_timer"

end
