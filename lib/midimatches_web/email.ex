defmodule MidimatchesWeb.Email do
  @moduledoc """
  Provides email functionalities for interacting with email provider
  """
  alias MidimatchesWeb.Auth
  alias MidimatchesWeb.Router.Helpers, as: Routes

  alias SendGrid.{
    Email,
    Mail
  }

  require Logger

  @from_address "midimatches@gmail.com"
  @host_url Application.get_env(:midimatches, :host_url)

  @spec password_reset_email(String.t(), String.t(), String.t()) :: :ok | {:error, any()}
  @doc """
  Sends a password reset email to the specified recipient. Only used for the purpose of account
  recovery.
  """
  def password_reset_email(recipient_email, username, user_id) do
    reset_slug = Auth.gen_reset_token(user_id)

    reset_link =
      @host_url <>
        Routes.page_path(MidimatchesWeb.Endpoint, :reset_password, reset_slug)

    Logger.info("sending password reset email for user_id=#{user_id} username=#{username}")

    body = reset_password_html(username, reset_link)

    Email.build()
    |> Email.add_to(recipient_email)
    |> Email.put_subject("Password Reset")
    |> Email.put_from(@from_address)
    |> Email.put_html(body)
    |> Mail.send()
  end

  @spec reset_password_html(String.t(), String.t()) :: String.t()
  def reset_password_html(username, reset_link) do
    """
    <div>
      <div>
        You have requested a password reset for your Midi Matches account (username: <strong>#{
      username
    }</strong>).
      </div>
      <br/>
      <div>
        <strong>
          <a href='#{reset_link}'>
            Click Here to Reset Password
          </a>
        </strong>
      </div>
      <br/>
      <div>
        For the sake of your account security, do <strong>NOT</strong> share this link with anyone. This link will expire in 6 hours.
      </div>
    </div>
    """
  end
end
