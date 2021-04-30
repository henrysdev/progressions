defmodule MidimatchesWeb.UserController do
  @moduledoc """
  Provides API for users. Note that users are only persisted at the session level.
  """
  use MidimatchesWeb, :controller

  alias MidimatchesDb, as: Db

  alias Midimatches.{
    ProfanityFilter,
    Types.User,
    UserCache,
    Utils
  }

  require Logger

  @min_user_alias_length 3
  @max_user_alias_length 10
  @min_password_length 10
  @max_password_length 32

  @type id() :: String.t()

  @spec self(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Get current session user
  """
  def self(conn, _params) do
    if has_user_session?(conn) do
      {curr_user, conn} =
        conn
        |> get_session(:user)
        |> handle_user_session(conn)

      conn
      |> json(%{
        user: curr_user
      })
    else
      json(conn, %{
        user: nil
      })
    end
  end

  defp handle_user_session(session_user, conn) when is_struct(session_user) do
    session_user
    |> Map.from_struct()
    |> handle_user_session(conn)
  end

  defp handle_user_session(session_user, conn) when is_map(session_user) do
    %{user_id: user_id} = struct(User, session_user)

    if UserCache.user_id_exists?(user_id) do
      user =
        user_id
        |> UserCache.get_user_by_id()
        |> Utils.server_to_client_user()

      {user, conn}
    else
      UserCache.delete_user_by_id()
      conn = delete_session(conn, :user)
      {nil, conn}
    end

    # UserCache.get_or_insert_user(session_user)
  end

  @spec reset(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Reset user session
  """
  def reset(conn, _params) do
    conn
    |> get_session(:user)
    |> (& &1.user_id).()
    |> UserCache.delete_user_by_id()

    conn
    |> delete_session(:user)
    |> json(%{})
  end

  @spec upsert(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Upsert user
  """
  def upsert(conn, %{"user_alias" => user_alias}) do
    user_id =
      if has_user_session?(conn) do
        get_session(conn, :user).user_id
      else
        "nosession"
      end

    with {:ok, user_alias} <- parse_user_alias(user_alias, user_id) do
      if has_user_session?(conn) do
        # update an existing user
        existing_user =
          get_session(conn, :user)
          |> (& &1.user_id).()
          |> UserCache.get_user_by_id()

        updated_user =
          %User{existing_user | user_alias: user_alias}
          |> UserCache.upsert_user()

        Logger.info("existing user updated alias user_id=#{user_id} user_alias=#{user_alias}")

        conn
        |> put_session(:user, updated_user)
        |> json(%{})
      else
        # create and insert new user
        # user_id = Utils.gen_uuid()
        # new_user =
        #   %User{user_alias: user_alias}
        #   |> UserCache.upsert_user()

        # TODO abstract further in UserCache layer or Users
        {:ok, new_db_user} =
          %{username: user_alias}
          |> Db.Users.create_unregistered_user()

        new_user = Utils.db_user_to_user(new_db_user)

        Logger.info("new user upserted with user_id=#{user_id} user_alias=#{user_alias}")

        conn
        |> put_session(:user, new_user)
        |> json(%{})
      end
    else
      {:error, reason} ->
        Logger.error("update user failed with error reason #{reason}")

        conn
        |> put_status(:bad_request)
        |> json(%{error: reason})
    end
  end

  @spec sync(Plug.Conn.t(), map) :: Plug.Conn.t()
  @doc """
  Sync server with client via NTP round-trip
  """
  def sync(conn, %{"client_start_time" => client_start_time}) do
    client_start_time = String.to_integer(client_start_time)
    server_time = Utils.curr_utc_timestamp()
    first_hop_delta_time = server_time - client_start_time

    conn
    |> json(%{
      first_hop_delta_time: first_hop_delta_time,
      server_time: server_time
    })
  end

  @spec parse_user_alias(String.t(), id()) :: {:error, String.t()} | {:ok, String.t()}
  def parse_user_alias(user_alias, user_id) do
    with {:ok, user_alias} <- validate_user_alias_length(user_alias),
         {:ok, user_alias} <- validate_user_alias_profanity(user_alias, user_id) do
      {:ok, user_alias}
    else
      {:error, reason} ->
        {:error, reason}
    end
  end

  defp validate_user_alias_length(user_alias) do
    user_alias_len = String.length(user_alias)

    if user_alias_len < @min_user_alias_length or user_alias_len > @max_user_alias_length do
      {:error, invalid_value_error("user_alias", :invalid_length)}
    else
      {:ok, user_alias}
    end
  end

  defp validate_user_alias_profanity(user_alias, user_id) do
    if ProfanityFilter.contains_profanity?(user_alias) do
      Logger.warn(
        "[PROFANITY_ALERT]: user_id=#{user_id} tried to change user to user_alias=#{user_alias}"
      )

      {:error, invalid_value_error("user_alias", :profanity)}
    else
      {:ok, user_alias}
    end
  end

  @spec parse_password(String.t()) :: {:error, String.t()} | {:ok, String.t()}
  def parse_password(password) do
    with {:ok, password} <- validate_password_length(password) do
      {:ok, password}
    else
      {:error, reason} ->
        {:error, reason}
    end
  end

  defp validate_password_length(password) do
    password_len = String.length(password)

    if password < @min_password_length or password_len > @max_password_length do
      {:error, invalid_value_error("password", :invalid_length)}
    else
      {:ok, password}
    end
  end
end
