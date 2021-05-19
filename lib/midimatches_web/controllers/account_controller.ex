defmodule MidimatchesWeb.AccountController do
  @moduledoc """
  Provides API for user accounts stored in the users database table.
  """
  use MidimatchesWeb, :controller

  alias MidimatchesDb, as: Db

  alias MidimatchesWeb.{
    Auth,
    Email
  }

  require Logger

  @spec create(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Create a new user account
  """
  def create(
        conn,
        %{
          "username" => _username,
          "email" => _email,
          "password" => _password
        } = user_params
      ) do
    case Db.Users.create_user(user_params) do
      {:ok, %Db.User{uuid: user_id} = created_user} ->
        conn
        |> Auth.put_bearer_token(user_id)
        |> json(%{user: created_user})

      {:error, changeset_error} ->
        bad_json_request(conn, changeset_error)
    end
  end

  @spec update(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Update the account
  """
  def update(conn, %{"uuid" => requested_user_id} = params) do
    user_id = conn.assigns[:auth_user].user_id

    if user_id == requested_user_id do
      user_change_params =
        params
        |> Map.delete("uuid")
        |> Map.delete("password")

      case Db.Users.update_user(requested_user_id, user_change_params) do
        {:ok, %Db.User{uuid: ^requested_user_id} = updated_user} ->
          conn
          |> json(%{user: updated_user})

        {:error, %{not_found: "user"} = reason} ->
          bad_json_request(conn, reason, :not_found)

        {:error, reason} ->
          bad_json_request(conn, reason)
      end
    else
      reason = "not authorized to make changes to requested user"
      bad_json_request(conn, reason, :unauthorized)
    end
  end

  @spec show(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Get the user account for the specified user uuid
  """
  def show(conn, %{"uuid" => uuid}) do
    case Db.Users.get_user_by(:uuid, uuid) do
      {:ok, user} ->
        conn
        |> json(%{user: user})

      {:error, %{not_found: "user"} = reason} ->
        bad_json_request(conn, reason, :not_found)

      {:error, reason} ->
        bad_json_request(conn, reason)
    end
  end

  @spec login(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Login to a user account and start an authenticated session
  """
  def login(conn, %{"username" => username, "password" => password}) do
    attempt_login(conn, %{username: username, password: password})
  end

  def login(conn, %{"email" => email, "password" => password}) do
    attempt_login(conn, %{email: email, password: password})
  end

  @spec logout(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  End the current authenticated user session if one is active
  """
  def logout(conn, _params) do
    user_id = conn.assigns[:auth_user].user_id

    case Db.Users.user_increment_session(user_id) do
      {:ok, _} ->
        conn
        |> clear_session()
        |> json(%{})

      {:error, reason} ->
        bad_json_request(conn, reason)
    end
  end

  @spec update_password(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Update the current user's password. If old credentials not provided, it's a password reset
  so also create a new bearer token.
  """
  def update_password(
        conn,
        %{
          "username" => username,
          "old_password" => old_password,
          "password" => _password
        } = user_params
      ) do
    user_id = conn.assigns[:auth_user].user_id
    old_creds = %{username: username, password: old_password}

    user_params =
      user_params
      |> Map.delete("old_password")
      |> Map.delete("username")

    with {:ok, _found_user} <- Db.Users.get_user_by_creds(old_creds),
         {:ok, _updated_user} <-
           Db.Users.update_user(user_id, user_params) do
      conn
      |> json(%{})
    else
      {:error, %{not_found: "user"} = reason} ->
        bad_json_request(conn, reason, :not_found)

      {:error, reason} ->
        bad_json_request(conn, reason)
    end
  end

  def update_password(
        conn,
        %{
          "password" => _password
        } = user_params
      ) do
    user_id = conn.assigns[:auth_user].user_id

    case Db.Users.update_user(user_id, user_params) do
      {:ok, %Db.User{uuid: user_id} = _updated_user} ->
        conn
        |> Auth.put_bearer_token(user_id)
        |> json(%{})

      {:error, %{not_found: "user"} = reason} ->
        bad_json_request(conn, reason, :not_found)

      {:error, reason} ->
        bad_json_request(conn, reason)
    end
  end

  # defp handle_password_update(conn, user_params) do
  #   user_id = conn.assigns[:auth_user].user_id

  #   case Db.Users.update_user(user_id, user_params) do
  #     {:ok, %Db.User{uuid: user_id} = _updated_user} ->
  #       conn
  #       |> Auth.put_bearer_token(user_id)
  #       |> json(%{})

  #     {:error, %{not_found: "user"} = reason} ->
  #       bad_json_request(conn, reason, :not_found)

  #     {:error, reason} ->
  #       bad_json_request(conn, reason)
  #   end
  # end

  @spec recovery(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Trigger account recovery via email password reset
  """
  def recovery(conn, %{"email" => email, "username" => username}) do
    query_args = [{:email, email}, {:username, username}]

    with {:ok, %Db.User{uuid: user_id}} <- Db.Users.get_user_by(query_args),
         :ok <- Email.password_reset_email(email, username, user_id) do
      json(conn, %{})
    else
      {:error, reason} ->
        bad_json_request(conn, reason)
    end
  end

  @spec attempt_login(Plug.Conn.t(), map) :: Plug.Conn.t()
  defp attempt_login(conn, user_params) do
    case Db.Users.get_user_by_creds(user_params) do
      {:ok, %Db.User{uuid: user_id}} ->
        conn
        |> Auth.put_bearer_token(user_id)
        |> json(%{})

      {:error, reason} ->
        bad_json_request(conn, reason, :unauthorized)
    end
  end
end
