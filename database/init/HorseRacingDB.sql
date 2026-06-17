USE [master]
GO
/****** Object:  Database [HorseRacingDB]    Script Date: 6/11/2026 2:23:38 PM ******/
CREATE DATABASE [HorseRacingDB]
 CONTAINMENT = NONE
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [HorseRacingDB] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [HorseRacingDB].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [HorseRacingDB] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [HorseRacingDB] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [HorseRacingDB] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [HorseRacingDB] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [HorseRacingDB] SET ARITHABORT OFF 
GO
ALTER DATABASE [HorseRacingDB] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [HorseRacingDB] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [HorseRacingDB] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [HorseRacingDB] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [HorseRacingDB] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [HorseRacingDB] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [HorseRacingDB] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [HorseRacingDB] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [HorseRacingDB] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [HorseRacingDB] SET  DISABLE_BROKER 
GO
ALTER DATABASE [HorseRacingDB] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [HorseRacingDB] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [HorseRacingDB] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [HorseRacingDB] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [HorseRacingDB] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [HorseRacingDB] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [HorseRacingDB] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [HorseRacingDB] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [HorseRacingDB] SET  MULTI_USER 
GO
ALTER DATABASE [HorseRacingDB] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [HorseRacingDB] SET DB_CHAINING OFF 
GO
ALTER DATABASE [HorseRacingDB] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [HorseRacingDB] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [HorseRacingDB] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [HorseRacingDB] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [HorseRacingDB] SET QUERY_STORE = ON
GO
ALTER DATABASE [HorseRacingDB] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [HorseRacingDB]
GO
/****** Object:  Table [dbo].[ban_history]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ban_history](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[blacklist_id] [int] NOT NULL,
	[action_by] [int] NOT NULL,
	[action_note] [nvarchar](500) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[bets]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[bets](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[race_id] [int] NOT NULL,
	[participant_id] [int] NOT NULL,
	[amount] [decimal](18, 2) NOT NULL,
	[odds] [decimal](10, 2) NOT NULL,
	[status] [nvarchar](20) NULL,
	[payout_amount] [decimal](18, 2) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[betting_transactions]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[betting_transactions](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[bet_id] [int] NOT NULL,
	[wallet_transaction_id] [int] NOT NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[blacklist]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[blacklist](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[target_type] [nvarchar](50) NOT NULL,
	[target_id] [int] NOT NULL,
	[reason] [nvarchar](500) NULL,
	[start_date] [date] NOT NULL,
	[end_date] [date] NULL,
	[is_permanent] [bit] NULL,
	[status] [nvarchar](20) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[chat_messages]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[chat_messages](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[room_id] [int] NOT NULL,
	[sender_id] [int] NOT NULL,
	[message] [nvarchar](max) NOT NULL,
	[message_type] [nvarchar](20) NULL,
	[is_deleted] [bit] NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[chat_rooms]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[chat_rooms](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[race_id] [int] NOT NULL,
	[status] [nvarchar](20) NULL,
	[created_at] [datetime] NULL,
	[closed_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[race_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[horse_breeds]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[horse_breeds](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[breed_name] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[breed_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[horse_owner_profiles]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[horse_owner_profiles](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[stable_name] [nvarchar](100) NULL,
	[bank_account] [nvarchar](100) NULL,
	[approval_status] [nvarchar](20) NULL,
	[stable_address] [nvarchar](255) NULL,
	[description] [nvarchar](500) NULL,
	[reputation_stars] [float] NULL,
	[phone] [varchar](20) NULL,
	[identity_number] [varchar](50) NULL,
	[date_of_birth] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[horses]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[horses](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[owner_id] [int] NOT NULL,
	[breed_id] [int] NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[age] [int] NULL,
	[gender] [nvarchar](20) NULL,
	[color] [nvarchar](50) NULL,
	[training_status] [nvarchar](50) NULL,
	[health_status] [nvarchar](50) NULL,
	[speed_rating] [float] NULL,
	[status] [nvarchar](20) NULL,
	[stamina_rating] [int] NULL,
	[gate_performance_rating] [int] NULL,
	[image_url] [nvarchar](1000) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[jockey_agreements]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[jockey_agreements](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[owner_id] [int] NOT NULL,
	[jockey_id] [int] NOT NULL,
	[message] [nvarchar](500) NULL,
	[status] [nvarchar](50) NULL,
	[sent_at] [datetime] NULL,
	[responded_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[jockey_profiles]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[jockey_profiles](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[height] [float] NULL,
	[weight] [float] NULL,
	[win_rate] [float] NULL,
	[experience_year] [int] NULL,
	[ranking_score] [int] NULL,
	[license_number] [nvarchar](100) NULL,
	[bank_account] [nvarchar](100) NULL,
	[approval_status] [nvarchar](20) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[notifications]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[notifications](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[title] [nvarchar](255) NOT NULL,
	[content] [nvarchar](max) NOT NULL,
	[type] [nvarchar](50) NULL,
	[is_read] [bit] NULL,
	[created_at] [datetime] NULL,
	[read_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[password_reset_tokens]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[password_reset_tokens](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[expiry_date] [datetime2](6) NOT NULL,
	[token] [varchar](255) NOT NULL,
	[user_id] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UK71lqwbwtklmljk3qlsugr1mig] UNIQUE NONCLUSTERED 
(
	[token] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UKla2ts67g4oh2sreayswhox1i6] UNIQUE NONCLUSTERED 
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[prize_distributions]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[prize_distributions](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[participant_id] [int] NOT NULL,
	[total_prize] [decimal](18, 2) NOT NULL,
	[owner_amount] [decimal](18, 2) NOT NULL,
	[jockey_amount] [decimal](18, 2) NOT NULL,
	[platform_fee] [decimal](18, 2) NOT NULL,
	[status] [nvarchar](20) NULL,
	[created_at] [datetime] NULL,
	[distributed_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[race_participants]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[race_participants](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[race_id] [int] NOT NULL,
	[horse_id] [int] NOT NULL,
	[jockey_id] [int] NOT NULL,
	[gate_number] [int] NULL,
	[final_rank] [int] NULL,
	[finish_time] [int] NULL,
	[average_speed] [float] NULL,
	[status] [nvarchar](50) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_race_horse] UNIQUE NONCLUSTERED 
(
	[race_id] ASC,
	[horse_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_race_jockey] UNIQUE NONCLUSTERED 
(
	[race_id] ASC,
	[jockey_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[race_registrations]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[race_registrations](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[race_id] [int] NOT NULL,
	[horse_id] [int] NOT NULL,
	[jockey_id] [int] NOT NULL,
	[owner_id] [int] NOT NULL,
	[status] [nvarchar](50) NULL,
	[created_at] [datetime] NULL,
	[jockey_share_percent] [float] NULL,
	[owner_share_percent] [float] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[race_simulations]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[race_simulations](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[race_id] [int] NOT NULL,
	[start_time] [datetime] NULL,
	[end_time] [datetime] NULL,
	[status] [nvarchar](50) NULL,
	[current_tick] [int] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[race_tracks]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[race_tracks](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[location] [nvarchar](255) NULL,
	[surface_condition] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[races]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[races](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[race_name] [nvarchar](255) NOT NULL,
	[tournament_id] [int] NOT NULL,
	[race_track_id] [int] NOT NULL,
	[race_date] [date] NOT NULL,
	[race_time] [time](7) NOT NULL,
	[race_round] [int] NOT NULL,
	[max_horses] [int] NOT NULL,
	[distance] [float] NOT NULL,
	[surface_type] [nvarchar](50) NULL,
	[weather] [nvarchar](50) NULL,
	[status] [nvarchar](50) NULL,
	[end_time] [time](7) NULL,
	[referee_id] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[referee_flags]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[referee_flags](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[referee_id] [int] NOT NULL,
	[horse_id] [int] NOT NULL,
	[simulation_id] [int] NOT NULL,
	[violation_type] [nvarchar](50) NOT NULL,
	[description] [nvarchar](500) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[refresh_tokens]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[refresh_tokens](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[expiry_date] [datetimeoffset](6) NOT NULL,
	[revoked] [bit] NOT NULL,
	[token] [varchar](512) NOT NULL,
	[user_id] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UKghpmfn23vmxfu3spu3lfg4r2d] UNIQUE NONCLUSTERED 
(
	[token] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[role_upgrade_requests]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[role_upgrade_requests](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[requested_role_id] [int] NOT NULL,
	[status] [nvarchar](20) NULL,
	[submitted_at] [datetime] NULL,
	[reviewed_by] [int] NULL,
	[reviewed_at] [datetime] NULL,
	[rejection_reason] [nvarchar](500) NULL,
	[notes] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[roles]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[roles](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[role_name] [varchar](50) NOT NULL,
	[description] [text] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[simulation_horse_states]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[simulation_horse_states](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[simulation_id] [int] NOT NULL,
	[horse_id] [int] NOT NULL,
	[current_position] [float] NULL,
	[speed] [float] NULL,
	[acceleration] [float] NULL,
	[stamina] [float] NULL,
	[rank_in_race] [int] NULL,
	[status] [nvarchar](50) NULL,
	[last_updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tournaments]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tournaments](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[tournament_name] [nvarchar](255) NOT NULL,
	[location] [nvarchar](255) NULL,
	[description] [nvarchar](1000) NULL,
	[registration_deadline] [datetime] NULL,
	[max_slots] [int] NULL,
	[start_date] [date] NULL,
	[end_date] [date] NULL,
	[total_prize] [decimal](18, 2) NULL,
	[tournament_status] [nvarchar](50) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[min_bet_amount] [numeric](38, 2) NULL,
	[prize_first] [numeric](38, 2) NULL,
	[prize_second] [numeric](38, 2) NULL,
	[prize_third] [numeric](38, 2) NULL,
	[image_url] [nvarchar](1000) NULL,
	[referee_id] [int] NULL,
	[entry_fee] [numeric](38, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[upgrade_request_documents]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[upgrade_request_documents](
	[upgrade_request_id] [int] NOT NULL,
	[document_url] [nvarchar](1000) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[upgrade_requests]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[upgrade_requests](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[created_at] [datetime2](6) NULL,
	[notes] [nvarchar](max) NULL,
	[rejection_reason] [nvarchar](max) NULL,
	[requested_role] [varchar](20) NOT NULL,
	[status] [varchar](20) NOT NULL,
	[updated_at] [datetime2](6) NULL,
	[user_id] [int] NOT NULL,
	[certification_number] [varchar](255) NULL,
	[date_of_birth] [date] NULL,
	[experience_years] [int] NULL,
	[full_name] [varchar](255) NULL,
	[height] [float] NULL,
	[identity_number] [varchar](255) NULL,
	[license_number] [varchar](255) NULL,
	[phone_number] [varchar](255) NULL,
	[stable_address] [varchar](255) NULL,
	[stable_name] [varchar](255) NULL,
	[weight] [float] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[user_connections]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[user_connections](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[requester_id] [int] NOT NULL,
	[recipient_id] [int] NOT NULL,
	[status] [nvarchar](20) NOT NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UK7eu4uisnpdfh04pa012x02ots] UNIQUE NONCLUSTERED 
(
	[requester_id] ASC,
	[recipient_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_User_Connection] UNIQUE NONCLUSTERED 
(
	[requester_id] ASC,
	[recipient_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[users]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[users](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[username] [varchar](255) NULL,
	[email] [varchar](255) NULL,
	[password] [varchar](255) NOT NULL,
	[full_name] [varchar](255) NULL,
	[phone] [varchar](20) NULL,
	[avatar_url] [varchar](255) NULL,
	[created_at] [datetime2](6) NULL,
	[provider_id] [varchar](255) NULL,
	[updated_at] [datetime2](6) NULL,
	[provider] [varchar](20) NOT NULL,
	[role] [varchar](20) NOT NULL,
	[enabled] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[verification_tokens]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[verification_tokens](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[expiry_date] [datetime2](6) NOT NULL,
	[token] [varchar](255) NOT NULL,
	[user_id] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UK6q9nsb665s9f8qajm3j07kd1e] UNIQUE NONCLUSTERED 
(
	[token] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UKdqp95ggn6gvm865km5muba2o5] UNIQUE NONCLUSTERED 
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[wallet_transactions]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[wallet_transactions](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[wallet_id] [int] NOT NULL,
	[transaction_type] [nvarchar](50) NOT NULL,
	[amount] [decimal](18, 2) NOT NULL,
	[status] [nvarchar](20) NULL,
	[reference_type] [nvarchar](50) NULL,
	[reference_id] [int] NULL,
	[payos_order_code] [bigint] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[wallets]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[wallets](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[balance] [decimal](18, 2) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[ban_history] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[bets] ADD  DEFAULT ('PENDING') FOR [status]
GO
ALTER TABLE [dbo].[bets] ADD  DEFAULT ((0)) FOR [payout_amount]
GO
ALTER TABLE [dbo].[bets] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[betting_transactions] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[blacklist] ADD  DEFAULT ((0)) FOR [is_permanent]
GO
ALTER TABLE [dbo].[blacklist] ADD  DEFAULT ('ACTIVE') FOR [status]
GO
ALTER TABLE [dbo].[blacklist] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[chat_messages] ADD  DEFAULT ('USER') FOR [message_type]
GO
ALTER TABLE [dbo].[chat_messages] ADD  DEFAULT ((0)) FOR [is_deleted]
GO
ALTER TABLE [dbo].[chat_messages] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[chat_rooms] ADD  DEFAULT ('ACTIVE') FOR [status]
GO
ALTER TABLE [dbo].[chat_rooms] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[horse_owner_profiles] ADD  DEFAULT ('PENDING') FOR [approval_status]
GO
ALTER TABLE [dbo].[horse_owner_profiles] ADD  DEFAULT ((5.0)) FOR [reputation_stars]
GO
ALTER TABLE [dbo].[horses] ADD  DEFAULT ((100)) FOR [stamina_rating]
GO
ALTER TABLE [dbo].[horses] ADD  DEFAULT ((100)) FOR [gate_performance_rating]
GO
ALTER TABLE [dbo].[jockey_agreements] ADD  DEFAULT ('Pending') FOR [status]
GO
ALTER TABLE [dbo].[jockey_agreements] ADD  DEFAULT (getdate()) FOR [sent_at]
GO
ALTER TABLE [dbo].[jockey_profiles] ADD  DEFAULT ((0)) FOR [win_rate]
GO
ALTER TABLE [dbo].[jockey_profiles] ADD  DEFAULT ((0)) FOR [experience_year]
GO
ALTER TABLE [dbo].[jockey_profiles] ADD  DEFAULT ((0)) FOR [ranking_score]
GO
ALTER TABLE [dbo].[jockey_profiles] ADD  DEFAULT ('Pending') FOR [approval_status]
GO
ALTER TABLE [dbo].[jockey_profiles] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[notifications] ADD  DEFAULT ('GENERAL') FOR [type]
GO
ALTER TABLE [dbo].[notifications] ADD  DEFAULT ((0)) FOR [is_read]
GO
ALTER TABLE [dbo].[notifications] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[prize_distributions] ADD  DEFAULT ('PENDING') FOR [status]
GO
ALTER TABLE [dbo].[prize_distributions] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[race_participants] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[race_registrations] ADD  DEFAULT ('Registered') FOR [status]
GO
ALTER TABLE [dbo].[race_registrations] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[race_simulations] ADD  DEFAULT ((0)) FOR [current_tick]
GO
ALTER TABLE [dbo].[race_simulations] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[referee_flags] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[role_upgrade_requests] ADD  DEFAULT ('Pending') FOR [status]
GO
ALTER TABLE [dbo].[role_upgrade_requests] ADD  DEFAULT (getdate()) FOR [submitted_at]
GO
ALTER TABLE [dbo].[simulation_horse_states] ADD  DEFAULT ((0)) FOR [current_position]
GO
ALTER TABLE [dbo].[simulation_horse_states] ADD  DEFAULT ((0)) FOR [speed]
GO
ALTER TABLE [dbo].[simulation_horse_states] ADD  DEFAULT ((0)) FOR [acceleration]
GO
ALTER TABLE [dbo].[simulation_horse_states] ADD  DEFAULT ((100)) FOR [stamina]
GO
ALTER TABLE [dbo].[simulation_horse_states] ADD  DEFAULT (getdate()) FOR [last_updated_at]
GO
ALTER TABLE [dbo].[tournaments] ADD  DEFAULT ((0)) FOR [total_prize]
GO
ALTER TABLE [dbo].[tournaments] ADD  DEFAULT ('Upcoming') FOR [tournament_status]
GO
ALTER TABLE [dbo].[tournaments] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[user_connections] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ('LOCAL') FOR [provider]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ('SPECTATOR') FOR [role]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ((1)) FOR [enabled]
GO
ALTER TABLE [dbo].[wallet_transactions] ADD  DEFAULT ('SUCCESS') FOR [status]
GO
ALTER TABLE [dbo].[wallet_transactions] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[wallets] ADD  DEFAULT ((0)) FOR [balance]
GO
ALTER TABLE [dbo].[wallets] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[ban_history]  WITH CHECK ADD FOREIGN KEY([action_by])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[ban_history]  WITH CHECK ADD FOREIGN KEY([blacklist_id])
REFERENCES [dbo].[blacklist] ([id])
GO
ALTER TABLE [dbo].[bets]  WITH CHECK ADD FOREIGN KEY([participant_id])
REFERENCES [dbo].[race_participants] ([id])
GO
ALTER TABLE [dbo].[bets]  WITH CHECK ADD FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[bets]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[betting_transactions]  WITH CHECK ADD FOREIGN KEY([bet_id])
REFERENCES [dbo].[bets] ([id])
GO
ALTER TABLE [dbo].[betting_transactions]  WITH CHECK ADD FOREIGN KEY([wallet_transaction_id])
REFERENCES [dbo].[wallet_transactions] ([id])
GO
ALTER TABLE [dbo].[chat_messages]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[chat_rooms] ([id])
GO
ALTER TABLE [dbo].[chat_messages]  WITH CHECK ADD FOREIGN KEY([sender_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[chat_rooms]  WITH CHECK ADD FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[horse_owner_profiles]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[horses]  WITH CHECK ADD FOREIGN KEY([breed_id])
REFERENCES [dbo].[horse_breeds] ([id])
GO
ALTER TABLE [dbo].[horses]  WITH CHECK ADD FOREIGN KEY([owner_id])
REFERENCES [dbo].[horse_owner_profiles] ([id])
GO
ALTER TABLE [dbo].[jockey_agreements]  WITH CHECK ADD  CONSTRAINT [FK_jockey_agreements_jockey] FOREIGN KEY([jockey_id])
REFERENCES [dbo].[jockey_profiles] ([id])
GO
ALTER TABLE [dbo].[jockey_agreements] CHECK CONSTRAINT [FK_jockey_agreements_jockey]
GO
ALTER TABLE [dbo].[jockey_agreements]  WITH CHECK ADD  CONSTRAINT [FK_jockey_agreements_owner] FOREIGN KEY([owner_id])
REFERENCES [dbo].[horse_owner_profiles] ([id])
GO
ALTER TABLE [dbo].[jockey_agreements] CHECK CONSTRAINT [FK_jockey_agreements_owner]
GO
ALTER TABLE [dbo].[jockey_profiles]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[notifications]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[password_reset_tokens]  WITH CHECK ADD  CONSTRAINT [FKk3ndxg5xp6v7wd4gjyusp15gq] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[password_reset_tokens] CHECK CONSTRAINT [FKk3ndxg5xp6v7wd4gjyusp15gq]
GO
ALTER TABLE [dbo].[prize_distributions]  WITH CHECK ADD FOREIGN KEY([participant_id])
REFERENCES [dbo].[race_participants] ([id])
GO
ALTER TABLE [dbo].[race_participants]  WITH CHECK ADD FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[race_participants]  WITH CHECK ADD FOREIGN KEY([jockey_id])
REFERENCES [dbo].[jockey_profiles] ([id])
GO
ALTER TABLE [dbo].[race_participants]  WITH CHECK ADD FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_horse] FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_horse]
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_jockey] FOREIGN KEY([jockey_id])
REFERENCES [dbo].[jockey_profiles] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_jockey]
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_owner] FOREIGN KEY([owner_id])
REFERENCES [dbo].[horse_owner_profiles] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_owner]
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_race] FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_race]
GO
ALTER TABLE [dbo].[race_simulations]  WITH CHECK ADD FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_simulations]  WITH CHECK ADD  CONSTRAINT [FK_simulation_race] FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_simulations] CHECK CONSTRAINT [FK_simulation_race]
GO
ALTER TABLE [dbo].[races]  WITH CHECK ADD FOREIGN KEY([race_track_id])
REFERENCES [dbo].[race_tracks] ([id])
GO
ALTER TABLE [dbo].[races]  WITH CHECK ADD FOREIGN KEY([tournament_id])
REFERENCES [dbo].[tournaments] ([id])
GO
ALTER TABLE [dbo].[referee_flags]  WITH CHECK ADD FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[referee_flags]  WITH CHECK ADD FOREIGN KEY([referee_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[referee_flags]  WITH CHECK ADD FOREIGN KEY([simulation_id])
REFERENCES [dbo].[race_simulations] ([id])
GO
ALTER TABLE [dbo].[refresh_tokens]  WITH CHECK ADD  CONSTRAINT [FK1lih5y2npsf8u5o3vhdb9y0os] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[refresh_tokens] CHECK CONSTRAINT [FK1lih5y2npsf8u5o3vhdb9y0os]
GO
ALTER TABLE [dbo].[role_upgrade_requests]  WITH CHECK ADD FOREIGN KEY([requested_role_id])
REFERENCES [dbo].[roles] ([id])
GO
ALTER TABLE [dbo].[role_upgrade_requests]  WITH CHECK ADD FOREIGN KEY([reviewed_by])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[role_upgrade_requests]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[simulation_horse_states]  WITH CHECK ADD FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[simulation_horse_states]  WITH CHECK ADD FOREIGN KEY([simulation_id])
REFERENCES [dbo].[race_simulations] ([id])
GO
ALTER TABLE [dbo].[upgrade_request_documents]  WITH CHECK ADD  CONSTRAINT [FKffj0otohe52eiahcbcg5hwgqp] FOREIGN KEY([upgrade_request_id])
REFERENCES [dbo].[upgrade_requests] ([id])
GO
ALTER TABLE [dbo].[upgrade_request_documents] CHECK CONSTRAINT [FKffj0otohe52eiahcbcg5hwgqp]
GO
ALTER TABLE [dbo].[upgrade_requests]  WITH CHECK ADD  CONSTRAINT [FK4k81tfrqofqiyecqios0uowox] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[upgrade_requests] CHECK CONSTRAINT [FK4k81tfrqofqiyecqios0uowox]
GO
ALTER TABLE [dbo].[user_connections]  WITH CHECK ADD FOREIGN KEY([recipient_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[user_connections]  WITH CHECK ADD FOREIGN KEY([requester_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[verification_tokens]  WITH CHECK ADD  CONSTRAINT [FK54y8mqsnq1rtyf581sfmrbp4f] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[verification_tokens] CHECK CONSTRAINT [FK54y8mqsnq1rtyf581sfmrbp4f]
GO
ALTER TABLE [dbo].[wallet_transactions]  WITH CHECK ADD FOREIGN KEY([wallet_id])
REFERENCES [dbo].[wallets] ([id])
GO
ALTER TABLE [dbo].[wallets]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[upgrade_requests]  WITH CHECK ADD CHECK  (([requested_role]='ADMIN' OR [requested_role]='RACE_REFEREE' OR [requested_role]='JOCKEY' OR [requested_role]='HORSE_OWNER' OR [requested_role]='SPECTATOR'))
GO
ALTER TABLE [dbo].[upgrade_requests]  WITH CHECK ADD CHECK  (([status]='REJECTED' OR [status]='APPROVED' OR [status]='PENDING'))
GO
ALTER TABLE [dbo].[users]  WITH CHECK ADD CHECK  (([provider]='GOOGLE' OR [provider]='LOCAL'))
GO
ALTER TABLE [dbo].[users]  WITH CHECK ADD CHECK  (([role]='ADMIN' OR [role]='RACE_REFEREE' OR [role]='JOCKEY' OR [role]='HORSE_OWNER' OR [role]='SPECTATOR'))
GO
-- ==========================================
-- TEST DATA FOR FE TESTING
-- ==========================================
USE [HorseRacingDB]
GO

-- 1. Insert Roles
INSERT INTO [dbo].[roles] ([role_name], [description]) VALUES
('ADMIN', 'System Administrator'),
('SPECTATOR', 'Normal User'),
('HORSE_OWNER', 'Horse Owner'),
('JOCKEY', 'Jockey'),
('RACE_REFEREE', 'Race Referee');
GO

-- 2. Insert Users (Password: Password123!)
INSERT INTO [dbo].[users] ([username], [email], [password], [full_name], [phone], [provider], [role], [enabled]) VALUES
('owner1', 'owner1@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test Owner 1', '0123456789', 'LOCAL', 'HORSE_OWNER', 1),
('jockey1', 'jockey1@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test Jockey 1', '0987654321', 'LOCAL', 'JOCKEY', 1),
('jockey2', 'jockey2@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test Jockey 2', '0987654322', 'LOCAL', 'JOCKEY', 1);
GO

-- 3. Insert Owner & Jockey Profiles
INSERT INTO [dbo].[horse_owner_profiles] ([user_id], [stable_name], [approval_status], [reputation_stars]) VALUES
((SELECT id FROM [users] WHERE username='owner1'), 'Lucky Stable', 'APPROVED', 5.0);
GO

INSERT INTO [dbo].[jockey_profiles] ([user_id], [approval_status], [win_rate], [experience_year], [ranking_score]) VALUES
((SELECT id FROM [users] WHERE username='jockey1'), 'APPROVED', 45.5, 5, 1200),
((SELECT id FROM [users] WHERE username='jockey2'), 'APPROVED', 30.0, 2, 800);
GO

-- 4. Insert Horse Breeds
INSERT INTO [dbo].[horse_breeds] ([breed_name]) VALUES
('Thoroughbred'), ('Arabian'), ('Quarter Horse'), ('Appaloosa');
GO

-- 5. Insert Horses
INSERT INTO [dbo].[horses] ([owner_id], [breed_id], [name], [age], [gender], [status]) VALUES
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='owner1')), (SELECT id FROM [horse_breeds] WHERE breed_name='Thoroughbred'), 'Lightning Bolt', 4, 'MALE', 'ACTIVE'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='owner1')), (SELECT id FROM [horse_breeds] WHERE breed_name='Arabian'), 'Desert Wind', 3, 'FEMALE', 'ACTIVE');
GO

ALTER TABLE [dbo].[betting_transactions]  WITH CHECK ADD FOREIGN KEY([wallet_transaction_id])
REFERENCES [dbo].[wallet_transactions] ([id])
GO
ALTER TABLE [dbo].[chat_messages]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[chat_rooms] ([id])
GO
ALTER TABLE [dbo].[chat_messages]  WITH CHECK ADD FOREIGN KEY([sender_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[chat_rooms]  WITH CHECK ADD FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[horse_owner_profiles]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[horses]  WITH CHECK ADD FOREIGN KEY([breed_id])
REFERENCES [dbo].[horse_breeds] ([id])
GO
ALTER TABLE [dbo].[horses]  WITH CHECK ADD FOREIGN KEY([owner_id])
REFERENCES [dbo].[horse_owner_profiles] ([id])
GO
ALTER TABLE [dbo].[jockey_agreements]  WITH CHECK ADD  CONSTRAINT [FK_jockey_agreements_jockey] FOREIGN KEY([jockey_id])
REFERENCES [dbo].[jockey_profiles] ([id])
GO
ALTER TABLE [dbo].[jockey_agreements] CHECK CONSTRAINT [FK_jockey_agreements_jockey]
GO
ALTER TABLE [dbo].[jockey_agreements]  WITH CHECK ADD  CONSTRAINT [FK_jockey_agreements_owner] FOREIGN KEY([owner_id])
REFERENCES [dbo].[horse_owner_profiles] ([id])
GO
ALTER TABLE [dbo].[jockey_agreements] CHECK CONSTRAINT [FK_jockey_agreements_owner]
GO
ALTER TABLE [dbo].[jockey_profiles]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[notifications]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[password_reset_tokens]  WITH CHECK ADD  CONSTRAINT [FKk3ndxg5xp6v7wd4gjyusp15gq] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[password_reset_tokens] CHECK CONSTRAINT [FKk3ndxg5xp6v7wd4gjyusp15gq]
GO
ALTER TABLE [dbo].[prize_distributions]  WITH CHECK ADD FOREIGN KEY([participant_id])
REFERENCES [dbo].[race_participants] ([id])
GO
ALTER TABLE [dbo].[race_participants]  WITH CHECK ADD FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[race_participants]  WITH CHECK ADD FOREIGN KEY([jockey_id])
REFERENCES [dbo].[jockey_profiles] ([id])
GO
ALTER TABLE [dbo].[race_participants]  WITH CHECK ADD FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_horse] FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_horse]
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_jockey] FOREIGN KEY([jockey_id])
REFERENCES [dbo].[jockey_profiles] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_jockey]
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_owner] FOREIGN KEY([owner_id])
REFERENCES [dbo].[horse_owner_profiles] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_owner]
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_race] FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_race]
GO
ALTER TABLE [dbo].[race_simulations]  WITH CHECK ADD FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_simulations]  WITH CHECK ADD  CONSTRAINT [FK_simulation_race] FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_simulations] CHECK CONSTRAINT [FK_simulation_race]
GO
ALTER TABLE [dbo].[races]  WITH CHECK ADD FOREIGN KEY([race_track_id])
REFERENCES [dbo].[race_tracks] ([id])
GO
ALTER TABLE [dbo].[races]  WITH CHECK ADD FOREIGN KEY([tournament_id])
REFERENCES [dbo].[tournaments] ([id])
GO
ALTER TABLE [dbo].[referee_flags]  WITH CHECK ADD FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[referee_flags]  WITH CHECK ADD FOREIGN KEY([referee_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[referee_flags]  WITH CHECK ADD FOREIGN KEY([simulation_id])
REFERENCES [dbo].[race_simulations] ([id])
GO
ALTER TABLE [dbo].[refresh_tokens]  WITH CHECK ADD  CONSTRAINT [FK1lih5y2npsf8u5o3vhdb9y0os] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[refresh_tokens] CHECK CONSTRAINT [FK1lih5y2npsf8u5o3vhdb9y0os]
GO
ALTER TABLE [dbo].[role_upgrade_requests]  WITH CHECK ADD FOREIGN KEY([requested_role_id])
REFERENCES [dbo].[roles] ([id])
GO
ALTER TABLE [dbo].[role_upgrade_requests]  WITH CHECK ADD FOREIGN KEY([reviewed_by])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[role_upgrade_requests]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[simulation_horse_states]  WITH CHECK ADD FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[simulation_horse_states]  WITH CHECK ADD FOREIGN KEY([simulation_id])
REFERENCES [dbo].[race_simulations] ([id])
GO
ALTER TABLE [dbo].[upgrade_request_documents]  WITH CHECK ADD  CONSTRAINT [FKffj0otohe52eiahcbcg5hwgqp] FOREIGN KEY([upgrade_request_id])
REFERENCES [dbo].[upgrade_requests] ([id])
GO
ALTER TABLE [dbo].[upgrade_request_documents] CHECK CONSTRAINT [FKffj0otohe52eiahcbcg5hwgqp]
GO
ALTER TABLE [dbo].[upgrade_requests]  WITH CHECK ADD  CONSTRAINT [FK4k81tfrqofqiyecqios0uowox] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[upgrade_requests] CHECK CONSTRAINT [FK4k81tfrqofqiyecqios0uowox]
GO
ALTER TABLE [dbo].[user_connections]  WITH CHECK ADD FOREIGN KEY([recipient_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[user_connections]  WITH CHECK ADD FOREIGN KEY([requester_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[verification_tokens]  WITH CHECK ADD  CONSTRAINT [FK54y8mqsnq1rtyf581sfmrbp4f] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[verification_tokens] CHECK CONSTRAINT [FK54y8mqsnq1rtyf581sfmrbp4f]
GO
ALTER TABLE [dbo].[wallet_transactions]  WITH CHECK ADD FOREIGN KEY([wallet_id])
REFERENCES [dbo].[wallets] ([id])
GO
ALTER TABLE [dbo].[wallets]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[tournaments]  WITH CHECK ADD  CONSTRAINT [FK_tournaments_referee] FOREIGN KEY([referee_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[tournaments] CHECK CONSTRAINT [FK_tournaments_referee]
GO
ALTER TABLE [dbo].[upgrade_requests]  WITH CHECK ADD CHECK  (([requested_role]='ADMIN' OR [requested_role]='RACE_REFEREE' OR [requested_role]='JOCKEY' OR [requested_role]='HORSE_OWNER' OR [requested_role]='SPECTATOR'))
GO
ALTER TABLE [dbo].[upgrade_requests]  WITH CHECK ADD CHECK  (([status]='REJECTED' OR [status]='APPROVED' OR [status]='PENDING'))
GO
ALTER TABLE [dbo].[users]  WITH CHECK ADD CHECK  (([provider]='GOOGLE' OR [provider]='LOCAL'))
GO
ALTER TABLE [dbo].[users]  WITH CHECK ADD CHECK  (([role]='ADMIN' OR [role]='RACE_REFEREE' OR [role]='JOCKEY' OR [role]='HORSE_OWNER' OR [role]='SPECTATOR'))
GO
-- ==========================================
-- TEST DATA FOR FE TESTING
-- ==========================================
USE [HorseRacingDB]
GO

-- 1. Insert Roles
INSERT INTO [dbo].[roles] ([role_name], [description]) VALUES
('ADMIN', 'System Administrator'),
('SPECTATOR', 'Normal User'),
('HORSE_OWNER', 'Horse Owner'),
('JOCKEY', 'Jockey'),
('RACE_REFEREE', 'Race Referee');
GO

-- 2. Insert Users (Password: Password123!)
INSERT INTO [dbo].[users] ([username], [email], [password], [full_name], [phone], [provider], [role], [enabled]) VALUES
('spectator1', 'spectator1@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test SPECTATOR 1', '0123400011', 'LOCAL', 'SPECTATOR', 1),
('spectator2', 'spectator2@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test SPECTATOR 2', '0123400012', 'LOCAL', 'SPECTATOR', 1),
('spectator3', 'spectator3@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test SPECTATOR 3', '0123400013', 'LOCAL', 'SPECTATOR', 1),
('spectator4', 'spectator4@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test SPECTATOR 4', '0123400014', 'LOCAL', 'SPECTATOR', 1),
('spectator5', 'spectator5@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test SPECTATOR 5', '0123400015', 'LOCAL', 'SPECTATOR', 1),
('spectator6', 'spectator6@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test SPECTATOR 6', '0123400016', 'LOCAL', 'SPECTATOR', 1),
('spectator7', 'spectator7@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test SPECTATOR 7', '0123400017', 'LOCAL', 'SPECTATOR', 1),
('spectator8', 'spectator8@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test SPECTATOR 8', '0123400018', 'LOCAL', 'SPECTATOR', 1),
('spectator9', 'spectator9@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test SPECTATOR 9', '0123400019', 'LOCAL', 'SPECTATOR', 1),
('spectator10', 'spectator10@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test SPECTATOR 10', '0123400020', 'LOCAL', 'SPECTATOR', 1),
('owner1', 'owner1@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test HORSE_OWNER 1', '0123400021', 'LOCAL', 'HORSE_OWNER', 1),
('owner2', 'owner2@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test HORSE_OWNER 2', '0123400022', 'LOCAL', 'HORSE_OWNER', 1),
('owner3', 'owner3@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test HORSE_OWNER 3', '0123400023', 'LOCAL', 'HORSE_OWNER', 1),
('owner4', 'owner4@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test HORSE_OWNER 4', '0123400024', 'LOCAL', 'HORSE_OWNER', 1),
('owner5', 'owner5@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test HORSE_OWNER 5', '0123400025', 'LOCAL', 'HORSE_OWNER', 1),
('owner6', 'owner6@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test HORSE_OWNER 6', '0123400026', 'LOCAL', 'HORSE_OWNER', 1),
('owner7', 'owner7@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test HORSE_OWNER 7', '0123400027', 'LOCAL', 'HORSE_OWNER', 1),
('owner8', 'owner8@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test HORSE_OWNER 8', '0123400028', 'LOCAL', 'HORSE_OWNER', 1),
('owner9', 'owner9@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test HORSE_OWNER 9', '0123400029', 'LOCAL', 'HORSE_OWNER', 1),
('owner10', 'owner10@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test HORSE_OWNER 10', '0123400030', 'LOCAL', 'HORSE_OWNER', 1),
('jockey1', 'jockey1@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test JOCKEY 1', '0123400031', 'LOCAL', 'JOCKEY', 1),
('jockey2', 'jockey2@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test JOCKEY 2', '0123400032', 'LOCAL', 'JOCKEY', 1),
('jockey3', 'jockey3@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test JOCKEY 3', '0123400033', 'LOCAL', 'JOCKEY', 1),
('jockey4', 'jockey4@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test JOCKEY 4', '0123400034', 'LOCAL', 'JOCKEY', 1),
('jockey5', 'jockey5@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test JOCKEY 5', '0123400035', 'LOCAL', 'JOCKEY', 1),
('jockey6', 'jockey6@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test JOCKEY 6', '0123400036', 'LOCAL', 'JOCKEY', 1),
('jockey7', 'jockey7@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test JOCKEY 7', '0123400037', 'LOCAL', 'JOCKEY', 1),
('jockey8', 'jockey8@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test JOCKEY 8', '0123400038', 'LOCAL', 'JOCKEY', 1),
('jockey9', 'jockey9@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test JOCKEY 9', '0123400039', 'LOCAL', 'JOCKEY', 1),
('jockey10', 'jockey10@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test JOCKEY 10', '0123400040', 'LOCAL', 'JOCKEY', 1),
('referee1', 'referee1@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test RACE_REFEREE 1', '0123400041', 'LOCAL', 'RACE_REFEREE', 1),
('referee2', 'referee2@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test RACE_REFEREE 2', '0123400042', 'LOCAL', 'RACE_REFEREE', 1),
('referee3', 'referee3@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test RACE_REFEREE 3', '0123400043', 'LOCAL', 'RACE_REFEREE', 1),
('referee4', 'referee4@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test RACE_REFEREE 4', '0123400044', 'LOCAL', 'RACE_REFEREE', 1),
('referee5', 'referee5@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test RACE_REFEREE 5', '0123400045', 'LOCAL', 'RACE_REFEREE', 1),
('referee6', 'referee6@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test RACE_REFEREE 6', '0123400046', 'LOCAL', 'RACE_REFEREE', 1),
('referee7', 'referee7@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test RACE_REFEREE 7', '0123400047', 'LOCAL', 'RACE_REFEREE', 1),
('referee8', 'referee8@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test RACE_REFEREE 8', '0123400048', 'LOCAL', 'RACE_REFEREE', 1),
('referee9', 'referee9@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test RACE_REFEREE 9', '0123400049', 'LOCAL', 'RACE_REFEREE', 1),
('referee10', 'referee10@test.com', '$2a$10$fGL7iOzTjw1bkUVT3vpfz.9DPzgsYnLpkOj6vg5I38/yCKjf7mVay', 'Test RACE_REFEREE 10', '0123400050', 'LOCAL', 'RACE_REFEREE', 1);
GO

-- 3. Insert Owner & Jockey Profiles
INSERT INTO [dbo].[horse_owner_profiles] ([user_id], [stable_name], [approval_status], [reputation_stars]) VALUES
((SELECT id FROM [users] WHERE username='owner1'), 'Stable 1', 'APPROVED', 5.0),
((SELECT id FROM [users] WHERE username='owner2'), 'Stable 2', 'APPROVED', 5.0),
((SELECT id FROM [users] WHERE username='owner3'), 'Stable 3', 'APPROVED', 5.0),
((SELECT id FROM [users] WHERE username='owner4'), 'Stable 4', 'APPROVED', 5.0),
((SELECT id FROM [users] WHERE username='owner5'), 'Stable 5', 'APPROVED', 5.0),
((SELECT id FROM [users] WHERE username='owner6'), 'Stable 6', 'APPROVED', 5.0),
((SELECT id FROM [users] WHERE username='owner7'), 'Stable 7', 'APPROVED', 5.0),
((SELECT id FROM [users] WHERE username='owner8'), 'Stable 8', 'APPROVED', 5.0),
((SELECT id FROM [users] WHERE username='owner9'), 'Stable 9', 'APPROVED', 5.0),
((SELECT id FROM [users] WHERE username='owner10'), 'Stable 10', 'APPROVED', 5.0);
GO

INSERT INTO [dbo].[jockey_profiles] ([user_id], [approval_status], [win_rate], [experience_year], [ranking_score]) VALUES
((SELECT id FROM [users] WHERE username='jockey1'), 'APPROVED', 31.0, 1, 1010),
((SELECT id FROM [users] WHERE username='jockey2'), 'APPROVED', 32.0, 2, 1020),
((SELECT id FROM [users] WHERE username='jockey3'), 'APPROVED', 33.0, 3, 1030),
((SELECT id FROM [users] WHERE username='jockey4'), 'APPROVED', 34.0, 4, 1040),
((SELECT id FROM [users] WHERE username='jockey5'), 'APPROVED', 35.0, 5, 1050),
((SELECT id FROM [users] WHERE username='jockey6'), 'APPROVED', 36.0, 6, 1060),
((SELECT id FROM [users] WHERE username='jockey7'), 'APPROVED', 37.0, 7, 1070),
((SELECT id FROM [users] WHERE username='jockey8'), 'APPROVED', 38.0, 8, 1080),
((SELECT id FROM [users] WHERE username='jockey9'), 'APPROVED', 39.0, 9, 1090),
((SELECT id FROM [users] WHERE username='jockey10'), 'APPROVED', 40.0, 10, 1100);
GO

-- 4. Insert Horse Breeds
INSERT INTO [dbo].[horse_breeds] ([breed_name]) VALUES
('Thoroughbred'), ('Arabian'), ('Quarter Horse'), ('Appaloosa');
GO

-- 5. Insert Horses
INSERT INTO [dbo].[horses] ([owner_id], [breed_id], [name], [age], [gender], [status]) VALUES
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='owner1')), (SELECT id FROM [horse_breeds] WHERE breed_name='Thoroughbred'), 'Horse 1', 4, 'MALE', 'ACTIVE'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='owner2')), (SELECT id FROM [horse_breeds] WHERE breed_name='Thoroughbred'), 'Horse 2', 4, 'MALE', 'ACTIVE'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='owner3')), (SELECT id FROM [horse_breeds] WHERE breed_name='Thoroughbred'), 'Horse 3', 4, 'MALE', 'ACTIVE'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='owner4')), (SELECT id FROM [horse_breeds] WHERE breed_name='Thoroughbred'), 'Horse 4', 4, 'MALE', 'ACTIVE'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='owner5')), (SELECT id FROM [horse_breeds] WHERE breed_name='Thoroughbred'), 'Horse 5', 4, 'MALE', 'ACTIVE'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='owner6')), (SELECT id FROM [horse_breeds] WHERE breed_name='Thoroughbred'), 'Horse 6', 4, 'MALE', 'ACTIVE'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='owner7')), (SELECT id FROM [horse_breeds] WHERE breed_name='Thoroughbred'), 'Horse 7', 4, 'MALE', 'ACTIVE'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='owner8')), (SELECT id FROM [horse_breeds] WHERE breed_name='Thoroughbred'), 'Horse 8', 4, 'MALE', 'ACTIVE'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='owner9')), (SELECT id FROM [horse_breeds] WHERE breed_name='Thoroughbred'), 'Horse 9', 4, 'MALE', 'ACTIVE'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='owner10')), (SELECT id FROM [horse_breeds] WHERE breed_name='Thoroughbred'), 'Horse 10', 4, 'MALE', 'ACTIVE');
GO

-- 6. Insert User Connections (owner1 is friends with jockey1)
INSERT INTO [dbo].[user_connections] ([requester_id], [recipient_id], [status], [created_at]) VALUES
((SELECT id FROM [users] WHERE username='owner1'), (SELECT id FROM [users] WHERE username='jockey1'), 'ACCEPTED', GETDATE());
GO

-- 7. Insert Race Tracks
INSERT INTO [dbo].[race_tracks] ([name], [location], [surface_condition]) VALUES
('Grand National Track', 'City Center', 'Good');
GO

-- 8. Insert Tournaments
INSERT INTO [dbo].[tournaments] ([tournament_name], [tournament_status], [start_date], [end_date], [image_url], [referee_id], [entry_fee]) VALUES
('Spring Championship 2026', 'Open Registration', '2026-07-01', '2026-07-15', 'https://example.com/tournament1.jpg', (SELECT id FROM [users] WHERE username='referee1'), 100.00),
('Summer Cup 2026', 'Registration Closed', '2026-08-01', '2026-08-15', 'https://example.com/tournament2.jpg', (SELECT id FROM [users] WHERE username='referee2'), 150.00),
('Winter Classic 2025', 'Ongoing', '2025-12-01', '2025-12-15', 'https://example.com/tournament3.jpg', (SELECT id FROM [users] WHERE username='referee3'), 200.00),
('End of Year Event 2026', 'Completed', '2026-10-01', '2026-10-15', 'https://example.com/tournament4.jpg', (SELECT id FROM [users] WHERE username='referee4'), 50.00);
GO

-- 9. Insert Races
INSERT INTO [dbo].[races] ([race_name], [tournament_id], [race_track_id], [race_date], [race_time], [race_round], [max_horses], [distance], [status]) VALUES
('Qualifier Round 1', 
 (SELECT id FROM [tournaments] WHERE tournament_name='Spring Championship 2026'), 
 (SELECT id FROM [race_tracks] WHERE name='Grand National Track'), 
 '2026-07-01', '14:00:00', 1, 10, 1200, 'Upcoming');
GO

USE [master]
GO
ALTER DATABASE [HorseRacingDB] SET  READ_WRITE 
GO
