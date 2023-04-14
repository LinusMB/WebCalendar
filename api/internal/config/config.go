package config

import (
	"strings"

	"github.com/spf13/viper"
)

const (
	cfgFn = "config"
)

func New() (*viper.Viper, error) {
	cfg := viper.New()
	cfg.SetConfigName(cfgFn)
	cfg.AddConfigPath(".")
	cfg.SetEnvPrefix("cal")
	replacer := strings.NewReplacer(".", "_", "-", "_")
	cfg.SetEnvKeyReplacer(replacer)
	if err := cfg.ReadInConfig(); err != nil {
		return nil, err
	}
	return cfg, nil
}
