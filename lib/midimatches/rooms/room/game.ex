defmodule Midimatches.Rooms.Room.Game do
  @moduledoc """
  Supervisor for a single room
  """
  use Supervisor

  alias Midimatches.{
    Pids,
    Rooms.Room.Game.ViewTimer,
    Rooms.Room.GameInstance,
    Types.GameRules,
    Utils
  }

  def start_link(args) do
    Supervisor.start_link(__MODULE__, args)
  end

  @impl true
  def init(args) do
    {room_id, players, audience_members, game_config} =
      case args do
        [{room_id, players, audience_members}] ->
          {room_id, players, audience_members, %GameRules{}}

        [{room_id, players, audience_members, room_config}] ->
          {room_id, players, audience_members, room_config}
      end

    Pids.register({:game_supervisor, room_id}, self())

    # assign game a unique id
    game_id = Utils.gen_uuid()

    # TODO pass game mode here via game_config
    children = [
      {ViewTimer, [{room_id}]},
      {GameInstance, [{room_id, game_id, players, audience_members, game_config}]}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  @spec stop_game(pid()) :: atom()
  @doc """
  Gracefully shut down a game supervisor and its children
  """
  def stop_game(pid), do: Supervisor.stop(pid)
end
