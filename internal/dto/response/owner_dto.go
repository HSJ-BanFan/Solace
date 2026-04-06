package response

// OwnerResponse 站长公开信息响应
type OwnerResponse struct {
	Nickname  string `json:"nickname,omitempty"`
	AvatarURL string `json:"avatar_url,omitempty"`
	Bio       string `json:"bio,omitempty"`
	GitHubURL string `json:"github_url,omitempty"`
}
