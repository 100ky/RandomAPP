import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, Modal } from 'react-native';
import { useSocialStore } from '../store/socialStore';
import { useGameStore } from '../store/gameStore';
import { TeamMember } from '../types/social';
import Clipboard from '@react-native-clipboard/clipboard';

type TeamModeProps = {
  onClose: () => void;
};

const TeamMode: React.FC<TeamModeProps> = ({ onClose }) => {
  const { isTeamMode, teamName, teamMembers, inviteCode, startTeamMode, endTeamMode, generateInviteCode, joinTeamWithCode } = useSocialStore();
  const { playerName, avatarId } = useGameStore();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartTeam = () => {
    if (newTeamName.trim()) {
      startTeamMode(newTeamName);
      setShowCreateModal(false);
    } else {
      Alert.alert("Chyba", "Zadejte název týmu");
    }
  };

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) {
      Alert.alert("Chyba", "Zadejte kód pro připojení");
      return;
    }
    
    setLoading(true);
    const success = await joinTeamWithCode(joinCode);
    setLoading(false);
    
    if (success) {
      setShowJoinModal(false);
      Alert.alert("Úspěch", "Připojili jste se k týmu!");
    } else {
      Alert.alert("Chyba", "Připojení k týmu se nezdařilo. Zkontrolujte kód a zkuste to znovu.");
    }
  };

  const handleCopyInviteCode = () => {
    if (inviteCode) {
      Clipboard.setString(inviteCode);
      Alert.alert("Zkopírováno", "Kód pro pozvánku byl zkopírován do schránky");
    }
  };

  const handleLeaveTeam = () => {
    Alert.alert(
      "Opustit tým",
      "Opravdu chcete opustit tým?",
      [
        { text: "Zrušit", style: "cancel" },
        { text: "Opustit", style: "destructive", onPress: endTeamMode }
      ]
    );
  };

  const renderTeamMember = ({ item }: { item: TeamMember }) => {
    const isCurrentUser = item.id === 'current-user';
    return (
      <View style={styles.memberItem}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>{item.avatarId.substring(0, 1).toUpperCase()}</Text>
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>
            {item.name} {isCurrentUser ? '(Ty)' : ''} {item.isLeader ? '👑' : ''}
          </Text>
          <Text style={[styles.memberStatus, { color: item.isOnline ? 'green' : 'red' }]}>
            {item.isOnline ? '● Online' : '● Offline'}
          </Text>
        </View>
      </View>
    );
  };

  if (!isTeamMode) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Týmový režim</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noTeamContainer}>
          <Text style={styles.noTeamText}>Nejste v žádném týmu</Text>
          <Text style={styles.noTeamDescription}>
            Vytvořte nový tým nebo se připojte k existujícímu týmu pomocí pozvánky.
          </Text>

          <TouchableOpacity 
            style={[styles.actionButton, styles.createButton]}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.actionButtonText}>Vytvořit nový tým</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.joinButton]} 
            onPress={() => setShowJoinModal(true)}
          >
            <Text style={styles.actionButtonText}>Připojit se ke stávajícímu týmu</Text>
          </TouchableOpacity>
        </View>

        {/* Modal pro vytvoření týmu */}
        <Modal
          visible={showCreateModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Vytvořit nový tým</Text>
              <TextInput
                style={styles.input}
                placeholder="Název týmu"
                value={newTeamName}
                onChangeText={setNewTeamName}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton} 
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Zrušit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalConfirmButton} 
                  onPress={handleStartTeam}
                >
                  <Text style={styles.modalConfirmButtonText}>Vytvořit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal pro připojení k týmu */}
        <Modal
          visible={showJoinModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Připojit se k týmu</Text>
              <TextInput
                style={styles.input}
                placeholder="Zadejte kód pozvánky"
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton} 
                  onPress={() => setShowJoinModal(false)}
                  disabled={loading}
                >
                  <Text style={styles.modalCancelButtonText}>Zrušit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalConfirmButton} 
                  onPress={handleJoinTeam}
                  disabled={loading}
                >
                  <Text style={styles.modalConfirmButtonText}>
                    {loading ? 'Připojování...' : 'Připojit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Týmový režim</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.teamInfoContainer}>
        <Text style={styles.teamName}>{teamName}</Text>
        <View style={styles.inviteContainer}>
          <Text style={styles.inviteCodeLabel}>Kód pro pozvání:</Text>
          <TouchableOpacity 
            style={styles.inviteCodeContainer} 
            onPress={handleCopyInviteCode}
          >
            <Text style={styles.inviteCode}>{inviteCode}</Text>
            <Text style={styles.copyIcon}>📋</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.membersContainer}>
        <Text style={styles.membersTitle}>Členové týmu ({teamMembers.length})</Text>
        <FlatList
          data={teamMembers}
          renderItem={renderTeamMember}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.membersList}
        />
      </View>

      <TouchableOpacity 
        style={[styles.actionButton, styles.leaveButton]} 
        onPress={handleLeaveTeam}
      >
        <Text style={styles.leaveButtonText}>Opustit tým</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '80%',
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  noTeamContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noTeamText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noTeamDescription: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  actionButton: {
    width: '80%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#4287f5',
  },
  joinButton: {
    backgroundColor: '#42b0f5',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalCancelButtonText: {
    color: '#666',
  },
  modalConfirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#4287f5',
  },
  modalConfirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  teamInfoContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inviteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteCodeLabel: {
    marginRight: 10,
    color: '#666',
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  inviteCode: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  copyIcon: {
    marginLeft: 8,
  },
  membersContainer: {
    flex: 1,
    padding: 20,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  membersList: {
    paddingBottom: 10,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4287f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  memberAvatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberStatus: {
    fontSize: 12,
  },
  leaveButton: {
    backgroundColor: '#ff4b4b',
    margin: 20,
  },
  leaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TeamMode;
