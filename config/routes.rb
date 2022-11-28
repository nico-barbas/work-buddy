Rails.application.routes.draw do
  devise_for :users
  root to: "pages#home"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  resources :users, only: [:show] do
    resources :avatars, only: [:create]
    resources :tasks, only: [:create]
    resources :playlists, only: [:create]
    resources :timers, only: [:create]
  end
  get "/users/:id/game", to: "users#game", as: "game"
  resources :tasks, only: [:update, :destroy]
  resources :playlists, only: [:update]
  resources :timers, only: [:update]
end
