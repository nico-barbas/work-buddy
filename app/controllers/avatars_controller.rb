class AvatarsController < ApplicationController
  def new
    @avatar = Avatar.new
  end

  def create
    # create a new avatar with a name (when you sign up you set you give you avatar name and it's created)
    @avatar = Avatar.new(avatar_params)
    @avatar.user = current_user
    if @avatar.save
      redirect_to user_path(current_user)
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def avatar_params
    params.require(:avatar).permit(:name)
  end
end
