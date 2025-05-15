import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput, Share } from 'react-native';
import { useSocialStore } from '../store/socialStore';
import { Route } from '../types/social';
import { formatDistance, formatDuration } from '../utils/formatters';

type RouteManagerProps = {
  onClose: () => void;
  onViewRoute?: (route: Route) => void;
};

const RouteManager: React.FC<RouteManagerProps> = ({ onClose, onViewRoute }) => {
  const { 
    savedRoutes, 
    isRecordingRoute, 
    startRouteRecording, 
    stopRouteRecording, 
    deleteRoute, 
    shareRoute, 
    importRoute 
  } = useSocialStore();
  
  const [showNewRouteModal, setShowNewRouteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [importCode, setImportCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleStartRecording = () => {
    if (newRouteName.trim()) {
      startRouteRecording(newRouteName);
      setNewRouteName('');
      setShowNewRouteModal(false);
      Alert.alert(
        "Záznam trasy zahájen", 
        "Záznam vaší trasy byl zahájen. Můžete pokračovat v hraní a až budete hotovi, stačí záznam ukončit."
      );
    } else {
      Alert.alert("Chyba", "Zadejte název trasy");
    }
  };
  
  const handleStopRecording = () => {
    Alert.alert(
      "Ukončit záznam",
      "Opravdu chcete ukončit záznam aktuální trasy?",
      [
        { text: "Zrušit", style: "cancel" },
        { 
          text: "Ukončit", 
          onPress: () => {
            const route = stopRouteRecording();
            if (route) {
              Alert.alert(
                "Trasa uložena",
                `Trasa "${route.name}" byla úspěšně uložena.`
              );
            }
          } 
        }
      ]
    );
  };
  
  const handleDeleteRoute = (route: Route) => {
    Alert.alert(
      "Odstranit trasu",
      `Opravdu chcete odstranit trasu "${route.name}"?`,
      [
        { text: "Zrušit", style: "cancel" },
        { 
          text: "Odstranit", 
          style: "destructive",
          onPress: () => deleteRoute(route.id)
        }
      ]
    );
  };
  
  const handleShareRoute = async (route: Route) => {
    try {
      setLoading(true);
      const shareCode = await shareRoute(route.id);
      setLoading(false);
      
      try {
        await Share.share({
          message: `Podívej se na moji trasu v aplikaci RandomAPP! Kód pro import: ${shareCode}`,
          title: `Sdílená trasa: ${route.name}`
        });
      } catch (e) {
        // Fallback pokud Share API není dostupné
        Alert.alert(
          "Kód pro sdílení",
          `Zde je kód pro sdílení vaší trasy:\n\n${shareCode}\n\nZkopírujte ho a pošlete přátelům.`
        );
      }
    } catch (e) {
      setLoading(false);
      Alert.alert("Chyba", "Nepodařilo se sdílet trasu");
    }
  };
  
  const handleImportRoute = async () => {
    if (!importCode.trim()) {
      Alert.alert("Chyba", "Zadejte kód pro import trasy");
      return;
    }
    
    setLoading(true);
    const success = await importRoute(importCode);
    setLoading(false);
    
    if (success) {
      setImportCode('');
      setShowImportModal(false);
      Alert.alert("Úspěch", "Trasa byla úspěšně importována");
    } else {
      Alert.alert("Chyba", "Nepodařilo se importovat trasu. Zkontrolujte kód a zkuste to znovu.");
    }
  };
  
  const renderRouteItem = ({ item }: { item: Route }) => {
    const formattedDistance = formatDistance(item.totalDistance);
    const formattedDuration = formatDuration(item.duration);
    
    return (
      <View style={styles.routeItem}>
        <View style={styles.routeDetails}>
          <Text style={styles.routeName}>{item.name}</Text>
          <Text style={styles.routeStats}>
            {formattedDistance} • {formattedDuration} • {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {item.isImported && (
            <Text style={styles.importedLabel}>Importováno</Text>
          )}
        </View>
        
        <View style={styles.routeActions}>
          {onViewRoute && (
            <TouchableOpacity 
              style={[styles.routeButton, styles.viewButton]}
              onPress={() => onViewRoute(item)}
            >
              <Text style={styles.buttonText}>👁️</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.routeButton, styles.shareButton]}
            onPress={() => handleShareRoute(item)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>📤</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.routeButton, styles.deleteButton]}
            onPress={() => handleDeleteRoute(item)}
          >
            <Text style={styles.buttonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Moje trasy</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionsContainer}>
        {!isRecordingRoute ? (
          <TouchableOpacity 
            style={[styles.actionButton, styles.startButton]} 
            onPress={() => setShowNewRouteModal(true)}
          >
            <Text style={styles.actionButtonText}>Zahájit záznam nové trasy</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.actionButton, styles.stopButton]} 
            onPress={handleStopRecording}
          >
            <Text style={styles.actionButtonText}>Ukončit záznam trasy</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.importButton]} 
          onPress={() => setShowImportModal(true)}
        >
          <Text style={styles.actionButtonText}>Importovat sdílenou trasu</Text>
        </TouchableOpacity>
      </View>
      
      {savedRoutes.length > 0 ? (
        <FlatList
          data={savedRoutes}
          renderItem={renderRouteItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.routesList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Zatím nemáte žádné uložené trasy</Text>
          <Text style={styles.emptyDescription}>
            Zahajte záznam nové trasy během vašeho průzkumu nebo importujte trasu od přátel.
          </Text>
        </View>
      )}
      
      {/* Modal pro vytvoření nové trasy */}
      <Modal
        visible={showNewRouteModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Zahájit záznam trasy</Text>
            <TextInput
              style={styles.input}
              placeholder="Název trasy"
              value={newRouteName}
              onChangeText={setNewRouteName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setShowNewRouteModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Zrušit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton} 
                onPress={handleStartRecording}
              >
                <Text style={styles.modalConfirmButtonText}>Zahájit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Modal pro import trasy */}
      <Modal
        visible={showImportModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Importovat trasu</Text>
            <TextInput
              style={styles.input}
              placeholder="Zadejte kód pro import"
              value={importCode}
              onChangeText={setImportCode}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setShowImportModal(false)}
                disabled={loading}
              >
                <Text style={styles.modalCancelButtonText}>Zrušit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton} 
                onPress={handleImportRoute}
                disabled={loading}
              >
                <Text style={styles.modalConfirmButtonText}>
                  {loading ? 'Importuji...' : 'Importovat'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  startButton: {
    backgroundColor: '#4287f5',
  },
  stopButton: {
    backgroundColor: '#f54242',
  },
  importButton: {
    backgroundColor: '#42b0f5',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyDescription: {
    textAlign: 'center',
    color: '#666',
  },
  routesList: {
    padding: 16,
  },
  routeItem: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  routeDetails: {
    flex: 1,
  },
  routeName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  routeStats: {
    color: '#666',
    fontSize: 13,
  },
  importedLabel: {
    color: '#4287f5',
    fontSize: 12,
    marginTop: 2,
  },
  routeActions: {
    flexDirection: 'row',
  },
  routeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  viewButton: {
    backgroundColor: '#f0f0f0',
  },
  shareButton: {
    backgroundColor: '#42b0f5',
  },
  deleteButton: {
    backgroundColor: '#ff8a8a',
  },
  buttonText: {
    fontSize: 16,
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
});

export default RouteManager;
