defmodule Midimatches.UserCache do
  use GenServer

  alias Midimatches.Types.User

  @type id() :: String.t()

  def init(arg) do
    if :ets.whereis(:user_cache) == :undefined do
      :ets.new(:user_cache, [
        :set,
        :public,
        :named_table,
        {:read_concurrency, true},
        {:write_concurrency, true}
      ])
    else
      :ok
    end

    {:ok, arg}
  end

  def start_link(arg) do
    GenServer.start_link(__MODULE__, arg, name: __MODULE__)
  end

  @spec upsert_user(%User{}) :: boolean()
  @doc """
  Upserts a user in the user cache keyed by user_id
  """
  def upsert_user(%User{user_id: user_id} = user) do
    :ets.insert(:user_cache, {user_id, user})
  end

  @spec get_user(id()) :: %User{} | nil
  @doc """
  Get the user value for the provided user_id
  """
  def get_user(user_id) do
    case :ets.lookup(:user_cache, user_id) do
      [] -> nil
      [{found_user_id, user}] when found_user_id == user_id -> user
    end
  end

  @spec delete_user(id()) :: boolean()
  @doc """
  Delete the user with the given user_id
  """
  def delete_user(user_id) do
    :ets.delete(:user_cache, user_id)
  end
end
