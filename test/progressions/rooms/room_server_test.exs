defmodule Midimatches.RoomServerTest do
  use ExUnit.Case

  alias Midimatches.{
    Pids,
    Rooms.RoomServer,
    TestHelpers,
    Types.GameRules,
    Types.Player
  }

  setup do
    TestHelpers.teardown_rooms()
    on_exit(fn -> TestHelpers.teardown_rooms() end)
  end

  test "sets up room server" do
    room_id = "1"
    room_name = "foobar"

    {:ok, room_server} = start_supervised({RoomServer, [{room_id, room_name}]})

    assert :sys.get_state(room_server) == %RoomServer{
             players: MapSet.new(),
             game_config: %GameRules{},
             room_name: room_name,
             room_id: room_id
           }
  end

  test "add and drop players" do
    room_id = "1"
    room_name = "foobar"

    [m1, m2, m3] = [
      %Player{
        musician_id: "m1",
        player_alias: "foo"
      },
      %Player{
        musician_id: "m2",
        player_alias: "zoo"
      },
      %Player{
        musician_id: "m3",
        player_alias: "fee"
      }
    ]

    {:ok, room_server} = start_supervised({RoomServer, [{room_id, room_name}]})

    RoomServer.add_player(room_server, m1)
    RoomServer.add_player(room_server, m2)
    RoomServer.add_player(room_server, m3)
    RoomServer.add_player(room_server, m3)
    RoomServer.drop_player(room_server, m1.musician_id)

    players =
      room_server
      |> RoomServer.get_players()
      |> MapSet.to_list()

    expected_players = [
      %Player{musician_id: "m2", player_alias: "zoo"},
      %Player{musician_id: "m3", player_alias: "fee"}
    ]

    assert players == expected_players
  end

  test "starts game when enough players have joined" do
    room_id = "1"
    room_name = "foobar"

    players = [
      %Player{
        musician_id: "m1",
        player_alias: "foo"
      },
      %Player{
        musician_id: "m2",
        player_alias: "zoo"
      },
      %Player{
        musician_id: "m3",
        player_alias: "fee"
      },
      %Player{
        musician_id: "m4",
        player_alias: "fum"
      }
    ]

    assert is_nil(Pids.fetch({:game_supervisor, room_id}))
    room_server = start_room_with_game(room_id, room_name, players)
    state = :sys.get_state(room_server)
    assert !is_nil(state.game)
  end

  test "reset room" do
    room_id = "1"
    room_name = "foobar"

    players = [
      %Player{
        musician_id: "m1",
        player_alias: "foo"
      },
      %Player{
        musician_id: "m2",
        player_alias: "zoo"
      },
      %Player{
        musician_id: "m3",
        player_alias: "fee"
      },
      %Player{
        musician_id: "m4",
        player_alias: "fum"
      }
    ]

    room_server = start_room_with_game(room_id, room_name, players)
    game_pid = :sys.get_state(room_server).game
    game_server = Pids.fetch!({:game_server, room_id})
    game_supervisor = Pids.fetch!({:game_supervisor, room_id})

    assert Process.alive?(game_pid) == true
    assert Process.alive?(game_server) == true
    assert Process.alive?(game_supervisor) == true

    RoomServer.reset_room(room_server)

    assert Process.alive?(game_pid) == false
    assert Process.alive?(game_server) == false
    assert Process.alive?(game_server) == false
  end

  @type id() :: String.t()
  @spec start_room_with_game(id(), String.t(), list(%Player{})) :: pid()
  defp start_room_with_game(room_id, room_name, players) do
    game_config = %GameRules{
      game_size_num_players: length(players)
    }

    {:ok, room_server} = start_supervised({RoomServer, [{room_id, room_name, game_config}]})

    Enum.each(players, fn player -> RoomServer.add_player(room_server, player) end)
    room_server
  end
end
