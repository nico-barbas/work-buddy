class ApplicationController < ActionController::Base
  before_action :authenticate_user!
  # before_action :label_time_clean_up
  before_action :configure_permitted_parameters, if: :devise_controller?

  def configure_permitted_parameters
    # For additional fields in app/views/devise/registrations/new.html.erb
    devise_parameter_sanitizer.permit(:sign_up, keys: [:username])

    # For additional in app/views/devise/registrations/edit.html.erb
    devise_parameter_sanitizer.permit(:account_update, keys: [:username])
  end

  # def label_time_clean_up
  #   @labels = Label.where(user: current_user)
  #   @labels.each do |label|
  #     if label.clean_date != Date.now
  #       label.daily_label_time = 0
  #       label.clean_date = Date.now
  #     end
  #   end
  # end

  def default_url_options
    { host: ENV["DOMAIN"] || "localhost:3000" }
  end
end
